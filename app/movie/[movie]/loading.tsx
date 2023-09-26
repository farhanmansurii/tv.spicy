import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function Loading() {
  return (
    <>
    <div className="lg:mx-auto">
      <div className="pb-4 lg:w-100">
        <div className="flex flex-col lg:w-11/12 mx-auto gap-4">
          <div className="relative h-full z-30">
            <Skeleton className="z-0 w-full aspect-video h-1/2" />
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
                  <Separator orientation="vertical" />
                  <Skeleton className="w-32 h-4" />
                  <Separator className="h-full" orientation="vertical" />
                  <Skeleton className="w-24 h-4" />
                </div>
                <Button
                  size="lg"
                  className="w-full bg-primary/70 md:w-fit px-5"
                >{'        '}</Button>
                <Skeleton className="text-sm h-16" />
              </div>
            </div>
            <Separator />
            <div className="justify-between gap-5 p-3 flex">
              <Button className="w-full bg-primary/70"></Button>
              <Button className="w-full bg-primary/70 "></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  )
}
