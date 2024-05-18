"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import { useState } from "react";

const LenisLayout = ({ children }: { children: React.ReactNode }) => {
  const lenisOptions = {
    lerp: 0.1,
    duration: 1.5,
    smoothTouch: true,
    smooth: true,
  };
  return (
    <ReactLenis root options={lenisOptions}>
      {children}
    </ReactLenis>
  );
};

export default LenisLayout;
