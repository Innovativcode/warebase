"use client";

import Lottie from "lottie-react";
import type { CSSProperties } from "react";

type LottiePlayerProps = {
  animationData: object;
  loop?: boolean;
  className?: string;
  style?: CSSProperties;
  preserveAspectRatio?: string;
};

export function LottiePlayer({
  animationData,
  loop = true,
  className,
  style,
  preserveAspectRatio = "xMidYMid slice",
}: LottiePlayerProps) {
  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay
      className={className}
      style={style}
      rendererSettings={{
        preserveAspectRatio,
      }}
    />
  );
}
