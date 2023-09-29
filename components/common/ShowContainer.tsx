import React, { Suspense } from "react";
import { Skeleton } from "../ui/skeleton";
import Episode from "../container/Episode";
import SeasonTabs from "../container/Seasons";
import { fetchDetails, fetchMovieLinks } from "@/lib/utils";
import { TVContainer } from "./TVContainer";
interface ShowContainerProps {
  type: string;
  id: string;
}
const ShowContainer: React.FC<ShowContainerProps> = async (props) => {
  const { type, id } = props;
  const showData = await fetchDetails(id, type);
  let streamingLinks;
  if (type === "movie") {
    streamingLinks = await fetchMovieLinks(id, showData.id);
  }
  return (
    <div className="w-[90%] flex mx-auto items-center flex-col">
      {showData &&
        (type === "tv" ? (
          <>
            <Suspense
              fallback={
                <Skeleton className="aspect-video w-full lg:w-[600px]  mx-auto my-4" />
              }
            >
              <TVContainer tv={showData} />
            </Suspense>
            <SeasonTabs seasons={showData?.seasons} id={showData.id} />
          </>
        ) : (
          
            <Episode
              episodeId={showData.episodeId}
              id={showData.id}
              type={type}
            />
        ))}
    </div>
  );
};

export default ShowContainer;
