import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Show } from '@/lib/types';
import CarousalCard from './DetailsCard';
import { fetchCarousalData } from '@/lib/utils';
export default async function CarousalComponent() {
  const data = await fetchCarousalData('discover');
  if (!data) return <div>None Found</div>;
  return (
    <>
      <Carousel className="mb-10">
        <CarouselContent className="w-full mx-auto flex ">
          {data?.map((el: Show) => (
            <CarouselItem key={el.id}>
              <CarousalCard isDetailsPage={false} show={el} type="movie" />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </>
  );
}
