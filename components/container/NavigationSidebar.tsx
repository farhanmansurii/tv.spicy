import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { fetchGenres } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

const NavigationSidebar = async () => {
  const movieGenres = await fetchGenres('movie');
  const tvGenres = await fetchGenres('tv');

  return (
    <div>
      <SheetContent className=" overflow-scroll py-10">
        <SheetHeader>
          <SheetTitle>Explore</SheetTitle>
          <SheetDescription>
            <Tabs className=' max-w-[80%]'>
              <TabsList className='w-full bg-background' defaultValue={'tv'}>
                <TabsTrigger value="movies">Movies </TabsTrigger>
                <TabsTrigger value="tv">TV </TabsTrigger>
              </TabsList>
              <TabsContent className="  " value="tv">
                {renderButtons(tvGenres, 'tv')}
              </TabsContent>
              <TabsContent className=" " value="movies">
                {renderButtons(movieGenres, 'movie')}
              </TabsContent>
            </Tabs>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </div>
  );
};

const renderButtons = (genres: any[], type: string) => {
  return (
    <>
      <Link href={`/discover/trending?type=${type}&title=Trending`}>
        <SheetTrigger className="w-full">
          <Button
            variant={'ghost'}
            className="flex w-full text-start justify-start"
          >
            Trending
          </Button>
        </SheetTrigger>
      </Link>

      <Link href={`/discover/airing-today?type=${type}&title=Airing Today`}>
        <SheetTrigger className="w-full">
          <Button
            variant={'ghost'}
            className="flex w-full text-start justify-start"
          >
            Airing Today
          </Button>
        </SheetTrigger>
      </Link>

      <Link href={`/discover/on-the-air?type=${type}&title=On The Air`}>
        <SheetTrigger className="w-full">
          <Button
            variant={'ghost'}
            className="flex w-full text-start justify-start"
          >
            On The Air
          </Button>
        </SheetTrigger>
      </Link>

      <Link href={`/discover/popular?type=${type}&title=Popular`}>
        <SheetTrigger className="w-full">
          <Button
            variant={'ghost'}
            className="flex w-full text-start justify-start"
          >
            Popular
          </Button>
        </SheetTrigger>
      </Link>

      <Link href={`/discover/top-rated?type=${type}&title=Top Rated`}>
        <SheetTrigger>
          {' '}
          <Button
            variant={'ghost'}
            className="flex w-full text-start justify-start"
          >
            Top Rated
          </Button>
        </SheetTrigger>
      </Link>
      {genres?.map((genre: any, index: number) => (
        <Link
          key={index}
          href={`/discover/${genre.name.toLowerCase()}?type=${type}&id=${
            genre.id
          }&title=${encodeURIComponent(genre.name)}`}
        >
          <SheetTrigger className="w-full">
            <Button
              variant={'ghost'}
              className="flex w-full text-start justify-start"
            >
              {genre.name}
            </Button>
          </SheetTrigger>
        </Link>
      ))}
    </>
  );
};

export default NavigationSidebar;
