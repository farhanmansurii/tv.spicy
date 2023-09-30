import React, { useState } from "react"; // Import React if not already imported
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { SeasonContent } from "./SeasonContent";
import { useEpisodeStore } from "@/store/episodeStore";
import { ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

interface Season {
  season: number;
  isReleased: boolean;
  episodes: Episode[];
}

interface Episode {
  releaseDate: string | number | Date;
  id: string;
  title: string;
  description: string;
  img: {
    mobile: string;
    hd: string;
  };
}

interface SeasonTabsProps {
  seasons: Season[];
  id: string;
  tv_id:string
}

const SeasonTabs: React.FC<SeasonTabsProps> = ({ seasons, id,tv_id }) => {
  return (
    <>
      <Tabs
        defaultValue={"Season " + seasons[0].season}
        className="w-full flex flex-col mx-auto"
      >
        <TabsList
          className="gap-4 bg-transparent overflow-scroll max-w-full justify-start
           sm:w-fit "
        >
          <div className="w-fit flex overflow-auto">
            {seasons.map((season, index) => (
              <TabsTrigger
                value={"Season " + season.season}
                key={season.season}
                className=""
              >
                Season {season.season}
              </TabsTrigger>
            ))}
          </div>
          {seasons.length > 4 && (
            <Button  size='icon' className=" px-2  w-7 h-7  rounded-full text-sm">
              <ChevronRight />
            </Button>
          )}
        </TabsList>
        {seasons.map((season) => (
          <TabsContent value={`Season ${season.season}`} key={season.season}>
            <SeasonContent id={id} tv_id={tv_id} season={season} />
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
};

export interface SeasonContentProps {
  season: Season;
  id: string;
  tv_id:string
}

export default SeasonTabs;
