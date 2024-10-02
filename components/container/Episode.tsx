"use client";
import React, { useEffect, useState, useRef } from "react";
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
    getNextEp?: () => void;
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

    const iframeRef = useRef<HTMLIFrameElement>(null);

    const generateUrl = (domain: string, type: string, id: string, seasonNumber: string, episodeNumber: string) => {
        return type === "movie"
            ? `https://${domain}/embed/${type}/${id}`
            : `https://${domain}/embed/tv/${id}/${seasonNumber}/${episodeNumber}`;
    };

    const sourcesMap = [
         {
            name:'smashystream',
            label:"Smashy stream",
            ads:'false',
            url: type==='movie'?`https://player.smashy.stream/movie/${id}`:`https://player.smashy.stream/tv/${id}?s=${seasonNumber}&e=${episodeNumber}`,
        },  {
            name:'vidsrc.cc/v3',
            label:"Vidsrc CC v3",
            ads:'false',
            url: generateUrl("vidsrc.cc/v3", type, id, seasonNumber, episodeNumber),
        },

         {
            name:'embed.su',
            label:"Embedded SU",
            ads:'false',
            url: generateUrl("embed.su", type, id, seasonNumber, episodeNumber),
        },

         {
            name:'vidlink',
            label:"VidLink",
            ads:'false',
          url: type==='movie'?`https://vidlink.pro/movie/${id}`:`https://player.smashy.stream/tv/${id}?s=${seasonNumber}&e=${episodeNumber}`,
         }, {
            name:'vidbinge',
            label:"Vidbinge 4K",
            ads:'false',
            url: generateUrl("vidbinge.dev", type, id, seasonNumber, episodeNumber),
        },
        {
            name:'player.vidsrc.nl',
            label:"VidSrc NL Hindi",
            ads:'false',
            url: generateUrl("player.vidsrc.nl", type, id, seasonNumber, episodeNumber),
        },



        {
            name: "vidsrc.vip",
            label: "Premium Stream",
            position: 4,
            url: generateUrl("vidsrc.rip", type, id, seasonNumber, episodeNumber),
        },
        {
            name: "vidsrc.icu",
            label: "Backup Stream",
            position: 3,
            url: generateUrl("vidsrc.icu", type, id, seasonNumber, episodeNumber),
        },
        {
            name: "vidsrc.pro",
            label: "Main Stream",
            position: 1,
            url: generateUrl("vidsrc.pro", type, id, seasonNumber, episodeNumber),
        },
        {
            name: "vidsrc.xyz",
            label: "Alternative Stream",
            position: 5,
            url: generateUrl("vidsrc.to", type, id, seasonNumber, episodeNumber),
        },

    ]
    console.log(`(logs) > sourcesMap: `, sourcesMap)

    const [provider, setProvider] = useState(sourcesMap[0]);

    const handleSelectOnChange = (value: string) => {
        const selectedProvider = sourcesMap.find((source) => source.name === value);
        setProvider(selectedProvider || sourcesMap[0]);
    };

    useEffect(() => {
        const handleIframeLoad = () => {
            if (iframeRef.current) {
                try {
                    const iframeWindow = iframeRef.current.contentWindow;
                    if (iframeWindow) {
                        iframeWindow.onbeforeunload = (e: BeforeUnloadEvent) => {
                            e.preventDefault();

                        };
                    }
                } catch (error) {
                    console.error("Error setting up iframe redirect prevention:", error);
                }
            }
        };

        if (iframeRef.current) {
            iframeRef.current.addEventListener('load', handleIframeLoad);
        }


    }, [provider]);

    return (
        <div id="episode-player" className="">
            <div className="flex items-center justify-between mb-2">
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
                                <div className="mx-1 flex gap-2">{source.label}</div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {getNextEp && (
                    <Button onClick={() => getNextEp()}>Next Episode</Button>
                )}
            </div>
            <iframe
                ref={iframeRef}
                allowFullScreen

                className="w-full h-full border-primary border rounded-lg aspect-video font-mono"
                src={provider.url}
            />
        </div>
    );
}
