import { cn, fetchRowData } from '@/lib/utils';
import { Suspense } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import Row from './Row';
export const FetchAndRenderRow = async (
  apiEndpoint: string,
  text: string,
  showRank: boolean,
  type: string,
  isVertical: boolean = false
) => {
  const rowData = await fetchRowData(apiEndpoint);

  return (
    <Suspense
      fallback={
        <Carousel className="w-11/12 mx-auto">
          <CarouselContent className="w-11/12 flex my-[3rem] ml-1 gap-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <CarouselItem
                className={cn(
                  `basis-1/2 w-full md:basis-1/3 lg:basis-1/4 xl:basis-1/5`,
                  index === 0 && 'ml-5'
                )}
                key={index}
              >
                <Skeleton className="aspect-video rounded-xl" key={index} />
                <Skeleton className="h-12 mt-1 rounded-xl" />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      }
    >
      <Row
        isVertical={isVertical}
        text={text}
        shows={showRank ? rowData.slice(0, 10) : rowData}
        type={type}
        showRank={showRank}
      />
    </Suspense>
  );
};
