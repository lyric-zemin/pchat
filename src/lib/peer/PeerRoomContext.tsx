"use client";

import * as React from "react";
import { usePeerRoom, type RoomEngine } from "./usePeerRoom";

const PeerRoomContext = React.createContext<RoomEngine | null>(null);

/** 引擎挂在落地页与房间页之上，跨视图切换时连接不会中断。 */
export function PeerRoomProvider({ children }: { children: React.ReactNode }) {
  const engine = usePeerRoom();
  return <PeerRoomContext.Provider value={engine}>{children}</PeerRoomContext.Provider>;
}

export function useRoomEngine(): RoomEngine {
  const engine = React.useContext(PeerRoomContext);
  if (!engine) throw new Error("useRoomEngine 必须在 PeerRoomProvider 内使用");
  return engine;
}
