import React from 'react'
import { Skeleton } from '../ui/skeleton'
import { Button } from '../ui/button'
// import { Separator } from '@radix-ui/react-separator'

export default function DetailLoader() {
  return (
    <>
    <div className="lg:mx-auto">
      <div className="pb-4 lg:w-100">
        <div className="flex flex-col w-full mx-auto gap-4">
          <div className="relative h-full z-30">
            
            <div className="z-0 w-full bg-background h-full md:h-[350px] " />
          </div>
          <div className="w-[90%] flex flex-col mx-auto">
            <div className="flex flex-row p-2 gap-4">
              <div className="flex flex-col justify-center gap-2">
                <div className="flex gap-4 items-center">
                  <Skeleton className="text-4xl h-12 font-bold lg:text-5xl w-40 " />
                  <Button size="xs" className="mt-1 bg-secondary w-10" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="w-8 h-4" />
                  {/* <Separator orientation="vertical" /> */}
                  <Skeleton className="w-32 h-4" />
                  {/* <Separator className="h-full" orientation="vertical" /> */}
                  <Skeleton className="w-24 h-4" />
                </div>
            
                <Skeleton className="text-sm h-16" />
              </div>
            </div>
            {/* <Separator /> */}
            <div className=" gap-5 p-3 flex">
              <Button className="w-full opacity-40 md:w-[200px] ">
                <Skeleton />
              </Button>
              <Button className="w-full opacity-40 md:w-[200px] ">
                <Skeleton />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  )
}
