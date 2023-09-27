"use client";
import React from "react"; // Import React if not already imported
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { SeasonContent } from "./SeasonContent";

interface Season {
  season: number;
  isReleased: boolean;
  episodes: Episode[];
}

interface Episode {
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
  defaultTab: number;
}

const SeasonTabs: React.FC<SeasonTabsProps> = ({ seasons, defaultTab }) => (
  <Tabs className="w-[90%] flex flex-col mx-auto">
    <TabsList
      defaultValue="Season 1"
      className="gap-4 overflow-scroll w-full md:w-fit text-white"
    >
      <div className="w-fit flex overflow-auto">
        {seasons.map((season, index) => (
          <TabsTrigger value={`Season ${season.season}`} key={season.season}>
            Season {season.season}
          </TabsTrigger>
        ))}
      </div>
    </TabsList>
    {seasons.map((season) => (
      <TabsContent value={`Season ${season.season}`} key={season.season}>
        <SeasonContent season={season} />
      </TabsContent>
    ))}
  </Tabs>
);

export interface SeasonContentProps {
  season: Season;
}

export default SeasonTabs;
