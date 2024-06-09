import { Button } from "@/components/ui/button";
import { Show } from "@/lib/types";
import {
  BookmarkIcon,
  LucidePlay,
  LucidePlayCircle,
  PlayCircleIcon,
  PlaySquareIcon,
  Plus,
} from "lucide-react";
import ContinueWatchingButton from "./ContinueWatchingButton";
import Link from "next/link";

/* eslint-disable @next/next/no-img-element */

interface CarousalCardProps {
  isDetailsPage?: boolean;
  show: Show;
  type?: string;
  id?: string;
}

export default function CarousalCard(props: CarousalCardProps) {
  const { show, isDetailsPage, type } = props;

  return (
    <>
      {props.show && (
        <>
          <div className="flex md:hidden   h-[70vh]   relative">
            <img
              alt=""
              className="inset-0 object-cover rounded-t-xl   h-full w-full"
              src={`https://image.tmdb.org/t/p/original/${props.show.poster_path}`}
            />
            <div className="   border-white absolute flex justify-between bg-gradient-to-t from-background to-transparent bottom-0 top-1/2 w-full   flex-col    ">
              <div></div>
              <div className="flex items-center flex-col">
                <div className="text-3xl text-pretty flex text-center w-9/12 items-center justify-center  font-bold">
                  {props.show.title || props.show.name}
                </div>
                <div className="opacity-50">
                  {props.show.genres?.name?.join(",") || "Comedy"}{" "}
                  {" • " +
                    (
                      props.show.release_date || props.show.first_air_date
                    ).split("-")[0]}
                </div>

                <div className="flex flex-col w-60 my-2     gap-2">
                  {!isDetailsPage && (
                    <Link href={`/movie/${props.show?.id}`}>
                      <Button className="rounded-sm w-full">
                        <svg
                          fill="currentColor"
                          viewBox="0 0 16 16"
                          className="w-7 h-7 p-1"
                        >
                          <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 010 1.393z" />
                        </svg>
                        Go to Show
                      </Button>
                    </Link>
                  )}
                  <ContinueWatchingButton
                    show={props.show}
                    type={props.type ?? ""}
                    id={props.show?.id}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="relative h-[70vh] md:flex hidden w-full  mx-auto  ">
            <img
              alt=""
              className=" h-full w-full rounded-t-xl object-center object-cover"
              src={`https://image.tmdb.org/t/p/original/${show.backdrop_path}`}
            />
            <div className="inset-0 bg-gradient-to-t from-background to-from-background/10  absolute justify-between flex flex-col">
              <div></div>
              <div className="w-[96%] mx-auto">
                <div className=" flex gap-1 flex-col  uppercase w-[500px] text-pretty">
                  <div className="text-3xl text-pretty font-bold ">
                    {show.title || show.name} (
                    {(show.first_air_date || show.release_date).split("-")[0]})
                  </div>
                  <div className="text-xs opacity-50 normal-case line-clamp-2">
                    {show?.overview}
                  </div>
                  <div className="flex my-2  gap-2">
                    {!isDetailsPage && (
                      <Link href={`/movie/${props.show?.id}`}>
                        <Button className="rounded-sm">
                          <svg
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            className="w-7 h-7 p-1"
                          >
                            <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 010 1.393z" />
                          </svg>
                          Go to Show
                        </Button>
                      </Link>
                    )}
                    <ContinueWatchingButton
                      show={props.show}
                      type={props.type ?? ""}
                      id={props.show?.id}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
