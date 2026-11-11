"use client";

import { motion } from "framer-motion";
import LobbyView from "@/components/lobby/LobbyView";
import DoorTransition from "@/components/room/DoorTransition";
import RoomView from "@/components/room/RoomView";
import { PeerRoomProvider, useRoomEngine } from "@/lib/peer/PeerRoomContext";
import { useRoomStore } from "@/lib/store";
import { useSceneClock } from "@/lib/time/useSceneClock";

function SceneRoot() {
  const phase = useRoomStore((state) => state.phase);
  const engine = useRoomEngine();
  useSceneClock(engine.broadcastTime);

  const inRoom = phase !== "lobby";

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <motion.div
        key={inRoom ? "room" : "lobby"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        {inRoom ? <RoomView /> : <LobbyView />}
      </motion.div>
      <DoorTransition />
    </main>
  );
}

export default function AppShell() {
  return (
    <PeerRoomProvider>
      <SceneRoot />
    </PeerRoomProvider>
  );
}
