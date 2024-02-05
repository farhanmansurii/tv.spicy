import React, { Suspense } from "react";
import { Skeleton } from "../ui/skeleton";
import Episode from "../container/Episode";
import SeasonTabs from "../container/Seasons";
import { fetchDetails, fetchMovieLinks } from "@/lib/utils";
import { TVContainer } from "./TVContainer";
import Row from "../container/Row";
import dynamic from "next/dynamic";
const RecommendationsContainer = dynamic(
  () => import("./RecommendationsContainer"),
  {
    loading: () => (
      <div className="flex w-full">
        <RowLoader />
        <RowLoader />
      </div>
    ),
  }
);
import RowLoader from "../loading/RowLoader";
import SeasonsTabLoader from "../container/SeasonsTabLoader";
interface ShowContainerProps {
  type: string;
  id: string;
}
const ShowContainer: React.FC<ShowContainerProps> = async (props) => {
  const { type, id } = props;
  const showData = await fetchDetails(id, type);
  let streamingLinks;
  if (type === "movie") {
    await fetchMovieLinks(id, showData.id, (err: any, res: any) => {
      if (err) console.log(err);
      streamingLinks = res;
    });
  }
  return (
    <div className="w-full flex mx-auto items-center gap-10  flex-col">
      {showData &&
        (type === "tv" ? (
          <>
            <Suspense fallback={<RowLoader />}>
              <div className="w-full">
                <TVContainer tv={showData} tv_id={id} />
                <SeasonTabs
                  seasons={showData?.seasons}
                  id={showData.id}
                  tv_id={id}
                />
              </div>
            </Suspense>
          </>
        ) : (
          <Suspense
            fallback={
              <Skeleton className="aspect-video w-full lg:w-[600px]  mx-auto my-4" />
            }
          >
            <Episode
              episodeId={showData.episodeId}
              id={showData.id}
              movieID={id}
              type={type}
            />
          </Suspense>
        ))}

    </div>
  );
};

export default ShowContainer;
