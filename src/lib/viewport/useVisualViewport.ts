"use client";

import { useEffect, useState } from "react";

export interface VisualViewportState {
  /** 可视视口高度；键盘弹起后小于 window.innerHeight。 */
  height: number;
  offsetTop: number;
  /** 需要从固定栏 bottom 上抬的距离，Android 上通常为 0。 */
  keyboardInset: number;
  keyboardOpen: boolean;
}

const INITIAL: VisualViewportState = {
  height: 0,
  offsetTop: 0,
  keyboardInset: 0,
  keyboardOpen: false,
};

/**
 * 只用于聊天抽屉：iOS Safari 键盘弹起时不会缩小 100vh/100dvh，
 * 需要按 visualViewport 把 fixed 抽屉抬离键盘并压低高度。
 * 不支持该 API 的浏览器直接返回默认态，走纯 CSS 布局。
 */
export function useVisualViewport(): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>(INITIAL);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    let frame = 0;
    const measure = () => {
      const height = viewport.height;
      const offsetTop = viewport.offsetTop;
      const keyboardInset = Math.max(
        0,
        window.innerHeight - height - offsetTop,
      );
      const next: VisualViewportState = {
        height,
        offsetTop,
        keyboardInset,
        keyboardOpen: keyboardInset > 120,
      };
      setState((prev) =>
        prev.height === next.height &&
        prev.offsetTop === next.offsetTop &&
        prev.keyboardInset === next.keyboardInset
          ? prev
          : next,
      );
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    };

    schedule();
    viewport.addEventListener("resize", schedule);
    viewport.addEventListener("scroll", schedule);
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", schedule);
      viewport.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return state;
}
