"use client";
import React, { useEffect, useState } from "react";
import OPlayer from "../common/Player";
import { fetchMovieLinks, fetchVidSrc } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Settings } from "lucide-react";
import Link from "next/link";

interface EpisodeProps {
  episodeId: string;
  id: string;
  movieID?: any;
  type: string;
  episodeNumber?: any;
  seasonNumber?: any;
  getNextEp: () => void;
}

export default function Episode(props: EpisodeProps) {
  const {
    episodeId,
    id,
    movieID,
    type,
    seasonNumber,
    episodeNumber,
    getNextEp,
  } = props;

  const sourcesMap = [
    {
      name: "vidsrc.vip",
      label: "Vidsrc VIP",
      url:
        type === "movie"
          ? `https://vidsrc.vip/embed/${type}/${movieID}`
          : `https://vidsrc.vip/embed/tv/${id}/${seasonNumber}/${episodeNumber}`,
    },
    {
      name: "vidsrc.pro",
      label: "Vidsrc Pro",
      url:
        type === "movie"
          ? `https://vidsrc.pro/embed/${type}/${movieID}`
          : `https://vidsrc.pro/embed/tv/${id}/${seasonNumber}/${episodeNumber}`,
    },

    {
      name: "vidsrc.icu",
      label: "Vidsrc ICU",
      url:
        type === "movie"
          ? `https://vidsrc.icu/embed/${type}/${movieID}`
          : `https://vidsrc.icu/embed/tv/${id}/${seasonNumber}/${episodeNumber}`,
    },
    {
      name: "vidsrc.xyz",
      label: "Vidsrc",
      url:
        type === "movie"
          ? `https://vidsrc.to/embed/${type}/${movieID}`
          : `https://vidsrc.to/embed/tv/${id}/${seasonNumber}/${episodeNumber}`,
    },

    {
      name: "smashystream",
      label: "Smashy  stream",
      url:
        type === "movie"
          ? `https://susflix.tv/api/embed/movie?id=${id}`
          : `https://susflix.tv/api/embed/tv?id=${id}&s=${seasonNumber}&e=${episodeNumber}`,
    },
  ];
  const [provider, setProvider] = useState(sourcesMap[0]);
  const handleSelectOnChange = (value: string) => {
    const selectedProvider = sourcesMap.find((source) => source.name === value);
    setProvider(selectedProvider || sourcesMap[0]);
  };
  return (
    <div id="episode-player" className="">
      <div className="flex   items-center justify-between mb-2">
        <Select
          defaultValue={provider.name || sourcesMap[0].name}
          onValueChange={handleSelectOnChange}
        >
          <SelectTrigger className="w-fit h-12 ">
            <Settings className="w-6 h-6 p-1 mr-2" />
            <SelectValue>
              <div className="pr-10">{provider.label}</div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {sourcesMap.map((source, index) => (
              <SelectItem value={source.name} key={index}>
                <div className="mx-1 flex gap-2">Server {source.label}</div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => getNextEp()}>Next Episode</Button>
      </div>
      <iframe
        allowFullScreen
        referrerPolicy="origin"
        className="w-full h-full border-primary border rounded-lg aspect-video font-mono"
        src={provider.url}
      />
    </div>
  );
}
