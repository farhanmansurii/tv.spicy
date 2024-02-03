'use client'
import { Button } from '@/components/ui/button';
import { CaretLeftIcon, HamburgerMenuIcon } from '@radix-ui/react-icons';
import { Search, Share } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import SearchBar from '../SearchBar';
import NavigationSidebar from '../container/NavigationSidebar';

export default function Navbar(props: { text?: string }) {
  return (
    <nav className="w-full absolute top-0 z-10 ">
      <div className="flex text-xl w-[98%] mx-auto font-bold p-2 py-4 flex-row justify-between items-center ">
        <Link href="/">
          {props.text && (
            <Button size={'icon'} className="rounded-full aspect-square p-2">
              <CaretLeftIcon className="h-full w-full" />
            </Button>
          )}
        </Link>
        <div className="flex gap-3">
          <Button size={'icon'} className="rounded-full aspect-square p-2">
            <Share className="h-full w-full" />
          </Button>
           <SearchBar/>
           <Sheet>
            <SheetTrigger asChild>
              <Button className="rounded-full p-2">
                <HamburgerMenuIcon className="h-full w-full" />
              </Button>
            </SheetTrigger>
            <NavigationSidebar />
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
