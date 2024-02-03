import { Circle, Loader2 } from 'lucide-react';
import React from 'react';

export default function Loading() {
  return (
    <div className=" align-middle  w-full h-screen flex items-center justify-center text-xl  ">
      <div className="flex items-center flex-col gap-2 ">
      <Loader2 className=" animate-spin ease-linear" />
              <div>Loading </div>
      </div>
    </div>
  );
}
