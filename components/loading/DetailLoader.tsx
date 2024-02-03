import React from "react";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";

export default function DetailLoader() {
  return (
    <>
    <div className="flex md:hidden h-[70vh] relative">
      <Skeleton className="absolute inset-0" />
    </div>
    <div className="relative h-[70vh] md:flex hidden mx-auto ">
      <Skeleton className="absolute inset-0" />
    </div>
  </>
  );
}
