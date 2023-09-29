import React, { useState } from "react"; // Import React if not already imported
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { SeasonContent } from "./SeasonContent";
import { useEpisodeStore } from "@/store/episodeStore";

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
}

const SeasonTabs: React.FC<SeasonTabsProps> = ({ seasons, id }) => {
  
  return (
    <>
      <Tabs defaultValue={"Season " + seasons[0].season} className="w-full flex flex-col mx-auto">
        <TabsList
          
          className="gap-4 overflow-scroll w-full sm:w-fit text-white"
        >
          <div className="w-fit flex overflow-auto">
            {seasons.map((season, index) => (
              <TabsTrigger
                value={"Season " + season.season}
                key={season.season}
              >
                Season {season.season}
              </TabsTrigger>
            ))}
          </div>
        </TabsList>
        {seasons.map((season) => (
          <TabsContent value={`Season ${season.season}`} key={season.season}>
            <SeasonContent id={id} season={season} />
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
};

export interface SeasonContentProps {
  season: Season;
  id: string;
}

export default SeasonTabs;
