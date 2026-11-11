export interface FriendlyError {
  title: string;
  detail: string;
}

const MAP: Record<string, FriendlyError> = {
  "peer-unavailable": {
    title: "没找到这间房",
    detail: "暗号可能打错了，或者对方还没点「开一间房」。核对一下再敲一次门。",
  },
  "unavailable-id": {
    title: "这个暗号已经被占用",
    detail: "有人正在用它开房。换一个暗号，或者直接用这个暗号去赴约。",
  },
  "network": {
    title: "连接服务没回应",
    detail: "检查网络后重试；如果用的是自建信令服务，确认它已经启动。",
  },
  "server-error": {
    title: "连接服务开小差了",
    detail: "稍等几秒再试一次。反复出现可以切换到自建信令服务。",
  },
  "socket-error": {
    title: "连接服务断开了",
    detail: "网络可能切换了。退出房间，重新开一次就好。",
  },
  "socket-closed": {
    title: "连接意外中断",
    detail: "退出房间再进一次，暗号可以接着用。",
  },
  "ssl-incompatible": {
    title: "加密连接不匹配",
    detail: "自建信令服务需要 HTTPS，或检查 NEXT_PUBLIC_PEER_SECURE 设置。",
  },
  "webrtc": {
    title: "视频通道没能建立",
    detail: "文字和氛围照常可用。可以关掉再打开摄像头，或换个网络重试。",
  },
  "disconnected": {
    title: "对方掉线了",
    detail: "连接已经断开。你可以留着这间房等对方回来，也可以离开。",
  },
  "room-full": {
    title: "房间里已经有两个人了",
    detail: "这是一对一的房间。等他们聊完，或者换一个暗号自己开一间。",
  },
};

const FALLBACK: FriendlyError = {
  title: "连接中断了",
  detail: "先退出房间，再重新开一次。暗号可以继续用。",
};

export function describePeerError(type: string): FriendlyError {
  return MAP[type] ?? FALLBACK;
}

export function describeJoinTimeout(): FriendlyError {
  return {
    title: "敲了很久没人应门",
    detail: "对方可能还没开房，或者暗号不一致。核对暗号后再试一次。",
  };
}

export function describeMediaError(): FriendlyError {
  return {
    title: "没能打开摄像头",
    detail: "浏览器需要 HTTPS 或 localhost 才允许使用摄像头；也可以用文字继续聊。",
  };
}
