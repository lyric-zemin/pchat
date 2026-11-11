"use client";

import { playCue } from "@/lib/audio/cues";
import { useRoomStore } from "@/lib/store";
import { currentPhase } from "@/lib/time/phases";
import { randomId } from "@/lib/utils";
import type { ChatMessage } from "@/types/room";
import { describePeerError } from "./errors";
import { buildSnapshot, parseRoomMessage, type RoomMessage } from "./protocol";

export function systemMessage(text: string): ChatMessage {
  return { id: randomId("s"), kind: "system", text, from: "system", at: Date.now() };
}

export interface HandlerDeps {
  send: (message: RoomMessage) => void;
  finishLeave: (delay: number) => void;
  clearWelcomeTimer: () => void;
  markClosing: () => void;
  isClosing: () => boolean;
}

/** 所有对端消息先经 parseRoomMessage 校验，再进入房间状态机。 */
export function createMessageHandler(deps: HandlerDeps) {
  return function handle(raw: unknown) {
    const message = parseRoomMessage(raw);
    if (!message) return;
    const s = useRoomStore.getState();
    const role = s.role;

    switch (message.type) {
      case "hello": {
        if (role !== "host") return;
        s.setPeerNickname(message.nickname);
        const snapshot = buildSnapshot({
          scenePhase: s.scenePhase,
          timeOverride: s.timeOverride,
          autoTime: s.autoTime,
          atmosphere: s.atmosphere,
          nickname: s.nickname,
          peerNickname: message.nickname,
          micOn: s.micOn,
          camOn: s.camOn,
        });
        deps.send({ type: "welcome", snapshot });
        s.setPhase("connected");
        s.setConnection("connected");
        s.setNotice("有人推门进来了");
        s.addMessage(systemMessage("门开了，对方坐了下来。"));
        playCue("arrive");
        break;
      }
      case "welcome": {
        if (role !== "guest") return;
        deps.clearWelcomeTimer();
        s.applySnapshot(message.snapshot);
        s.setPhase("connected");
        s.setConnection("connected");
        s.setNotice("你们在同一间房里了");
        s.addMessage(systemMessage("你推门进来，屋里已经亮着灯。"));
        playCue("arrive");
        break;
      }
      case "room-full": {
        s.setError(describePeerError("room-full"));
        s.setNotice(null);
        deps.markClosing();
        deps.finishLeave(2800);
        break;
      }
      case "chat":
      case "emoji": {
        s.addMessage({
          id: message.id,
          kind: message.type,
          text: message.type === "chat" ? message.text : message.emoji,
          from: "peer",
          at: message.at,
        });
        s.setPeerTyping(false);
        playCue("message");
        break;
      }
      case "typing":
        s.setPeerTyping(message.active);
        break;
      case "atmosphere":
        s.setAtmosphere(message.key, message.value);
        break;
      case "time-override": {
        if (message.phase) {
          s.setScenePhase(message.phase);
          s.setTimeOverride(message.phase);
          s.setAutoTime(false);
        } else {
          const next = currentPhase(new Date());
          s.setAutoTime(true);
          s.setTimeOverride(null);
          s.setScenePhase(next);
          if (role === "host") deps.send({ type: "time-sync", phase: next, auto: true });
        }
        break;
      }
      case "time-sync": {
        // 房主是时间权威，访客只接受不下发的状态。
        if (role !== "guest") return;
        s.setScenePhase(message.phase);
        s.setAutoTime(message.auto);
        if (message.auto) s.setTimeOverride(null);
        break;
      }
      case "media-state":
        s.setPeerMedia({ mic: message.mic, cam: message.cam });
        break;
      case "leave": {
        if (deps.isClosing()) return;
        deps.markClosing();
        const text =
          message.reason === "error"
            ? "对方那边断开了，屋子安静下来。"
            : "对方起身告辞了，灯慢慢暗下去。";
        s.setPhase("leaving");
        s.setNotice(text);
        s.setRemoteReady(false);
        s.addMessage(systemMessage(text));
        playCue("leave");
        deps.finishLeave(1800);
        break;
      }
      case "ping":
        break;
    }
  };
}

