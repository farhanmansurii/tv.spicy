"use client";
import React, { useEffect, useMemo, useRef } from "react";
import Player from "@oplayer/core";
import OUI from "@oplayer/ui";
import OHls from "@oplayer/hls";
import { useEpisodeStore } from "@/store/episodeStore";
import { chromecast } from "@oplayer/plugins";
import useTVShowStore from "@/store/recentsStore";
type Ctx = {
  ui: ReturnType<typeof OUI>;
  hls: ReturnType<typeof OHls>;
  menu: any;
};

export default function OPlayer({
  sources,
  subtitles,
  episode,
  type,
  provider,
  source,
}: {
  sources: any;
  subtitles: any[];
  episode?: any;
  type: string;
  provider: string;
  source?: any;
}) {
  const { activeEP } = useEpisodeStore();
  const { recentlyWatched } = useTVShowStore();
  function calculateTimeFromPercentage(
    percentage: number,
    totalTime: number | undefined
  ): number | null {
    if (
      totalTime &&
      !isNaN(totalTime) &&
      percentage >= 0 &&
      percentage <= 100
    ) {
      return (percentage / 100) * totalTime;
    } else {
      return null; // Return null when totalTime is not available or percentage is invalid
    }
  }

  const { updateTimeWatched } = useTVShowStore();
  function findAutoQualityUrl(videoUrls: any) {
    const autoQualityVideos = videoUrls.filter(
      (video: any) => video.quality === "auto"
    );
    return autoQualityVideos[0]?.src || videoUrls[0]?.src;
  }

  const playerRef = useRef<Player<Ctx>>(undefined);
  let image: string = "",
    title: string = "";
  if (type === "tv") {
    image = activeEP.img.hd;
    title =
      "S" + activeEP.season + "E" + activeEP.episode + ": " + activeEP.title;
  } else {
    title = "";
    image = episode?.image;
  }
  const includesEng = subtitles.filter((subtitle) => {
    return (
      subtitle.lang.toLowerCase().includes("english") ||
      subtitle.lang.toLowerCase().includes("eng")
    );
  });
  // const titleToDisplay = title !== "Full" ? `E${episode.number} ${title}` : "";
  const subtitlesList = useMemo(() => {
    const firstEnglishSubtitleIndex = subtitles.findIndex(subtitle =>
      subtitle?.lang?.toLowerCase().includes('english') || subtitle?.lang?.toLowerCase() === 'eng'
    );
    const subtitleTracks = includesEng
      ?.filter(subtitle =>
        subtitle.url &&
        (subtitle.url.endsWith('.vtt') || subtitle.url.endsWith('.srt'))
      )
      .map((subtitle, index) => ({
        src: subtitle.url,
        default: index===0,
        name: subtitle.lang,
      })) || [];
    return subtitleTracks
  }, [subtitles]);
  const plugins = [
    OUI({
      fullscreen: true,
      coverButton: true,
      miniProgressBar: true,
      forceLandscapeOnFullscreen: true,
      screenshot: false,
      highlight: {
        color: "#fff", //default
        source: [],
      },
      pictureInPicture: true,
      showControls: "always",
      theme: { primaryColor: "gray" },
      speeds: ["2.0", "1.75", "1.25", "1.0", "0.75", "0.5"],
      slideToSeek: "none",
      controlBar: { back: "always" },
      topSetting: false,
      subtitle: {
        fontSize: 20,
        background: true,
      },
      settings: [
        "loop",
        {
          name: "Quality",
          key: "KEY",
          type: "selector", // or 'switcher'

          icon: ` <svg
            viewBox="0 0 24 24"
            fill="currentColor"
         className='w-7 h-7 '
          >
            <path d="M14.5 13.5h2v-3h-2M18 14a1 1 0 01-1 1h-.75v1.5h-1.5V15H14a1 1 0 01-1-1v-4a1 1 0 011-1h3a1 1 0 011 1m-7 5H9.5v-2h-2v2H6V9h1.5v2.5h2V9H11m8-5H5c-1.11 0-2 .89-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
          </svg>`,
          children: sources.map((source: any, index: number) => ({
            name: source.name,
            value: source.src,
            default: index === 0,
          })),
          onChange({ value }) {
            const oplayer = playerRef.current;
            if (!oplayer) return;
            oplayer
              .changeSource({ src: value, poster: image, title })
              .then(() =>
                oplayer.context.ui.subtitle?.changeSource(subtitlesList)
              );
          },
        },
      ],
    }),
    chromecast,
    OHls(),
  ];

  useEffect(() => {
    playerRef.current = Player.make("#oplayer")
      .use(plugins)
      .create() as Player<Ctx>;
    if (!playerRef) return;
    var forward = document.createElement("button");
    forward.className = "forward";
    forward.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.444 3.685A10 10 0 0 1 18 4h-2v2h4a1 1 0 0 0 1-1V1h-2v1.253A12 12 0 1 0 24 12h-2A10 10 0 1 1 6.444 3.685ZM22 4v3h-3v2h4a1 1 0 0 0 1-1V4h-2Zm-9.398 11.576c.437.283.945.424 1.523.424s1.083-.141 1.513-.424c.437-.29.774-.694 1.009-1.215.235-.527.353-1.148.353-1.861 0-.707-.118-1.324-.353-1.851-.235-.527-.572-.932-1.009-1.215-.43-.29-.935-.434-1.513-.434-.578 0-1.086.145-1.523.434-.43.283-.764.688-.999 1.215-.235.527-.353 1.144-.353 1.851 0 .713.118 1.334.353 1.86.236.522.568.927.999 1.216Zm2.441-1.485c-.222.373-.528.56-.918.56s-.696-.187-.918-.56c-.222-.38-.333-.91-.333-1.591 0-.681.111-1.208.333-1.581.222-.38.528-.57.918-.57s.696.19.918.57c.222.373.333.9.333 1.581 0 .681-.111 1.212-.333 1.59Zm-6.439-3.375v5.14h1.594V9.018L7 9.82v1.321l1.604-.424Z" fill="currentColor"></path></svg>';
    forward.onclick = function () {
      playerRef.current?.seek(playerRef.current?.currentTime + 10);
    };

    var backward = document.createElement("button");
    backward.className = "backward";
    backward.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.02 2.048A10 10 0 1 1 2 12H0a12 12 0 1 0 5-9.747V1H3v4a1 1 0 0 0 1 1h4V4H6a10 10 0 0 1 5.02-1.952ZM2 4v3h3v2H1a1 1 0 0 1-1-1V4h2Zm12.125 12c-.578 0-1.086-.141-1.523-.424-.43-.29-.764-.694-.999-1.215-.235-.527-.353-1.148-.353-1.861 0-.707.118-1.324.353-1.851.236-.527.568-.932.999-1.215.437-.29.945-.434 1.523-.434s1.083.145 1.513.434c.437.283.774.688 1.009 1.215.235.527.353 1.144.353 1.851 0 .713-.118 1.334-.353 1.86-.235.522-.572.927-1.009 1.216-.43.283-.935.424-1.513.424Zm0-1.35c.39 0 .696-.186.918-.56.222-.378.333-.909.333-1.59s-.111-1.208-.333-1.581c-.222-.38-.528-.57-.918-.57s-.696.19-.918.57c-.222.373-.333.9-.333 1.581 0 .681.111 1.212.333 1.59.222.374.528.56.918.56Zm-5.521 1.205v-5.139L7 11.141V9.82l3.198-.8v6.835H8.604Z" fill="currentColor"></path></svg>';
    backward.onclick = function () {
      playerRef.current?.seek(playerRef.current.currentTime - 10);
    };

    playerRef.current.$root.appendChild(backward);
    playerRef.current.$root.appendChild(forward);

    return () => {
      playerRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    const oplayer = playerRef.current;
    if (!oplayer) return;
    oplayer.context.ui.menu.unregister("Source");
    oplayer
      .changeSource({
        src: findAutoQualityUrl(sources),
        poster: image,
        title,
      })
      .then(() => oplayer.context.ui.subtitle?.changeSource(subtitlesList))
      .catch((err) => console.log(err));

    const ep = recentlyWatched.find(
      (epi: any) => epi?.tv_id === activeEP?.tv_id && epi?.id === activeEP?.id
    );
    if (type === "tv" && ep && ep.time) {
      oplayer.on("loadedmetadata", () => {
        const calculatedTime = calculateTimeFromPercentage(
          ep.time,
          oplayer?.duration
        );
        if (calculatedTime) {
          oplayer.seek(calculatedTime);
          oplayer.context.ui.changHighlightSource([
            {
              time: calculatedTime,
              text: "Continue Watching",
            },
          ]);
        }
      });
    }
  }, [sources, subtitles]);
  const watchTimeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const handleTimeUpdate = () => {
      clearTimeout(watchTimeTimeoutRef.current!); // Clear previous timeout (if any)
      watchTimeTimeoutRef.current = setTimeout(() => {
        if (playerRef.current) {
          const currentTime = playerRef.current.currentTime;
          const totalTime = playerRef.current.duration;
          const watchTimePercent = Math.floor((currentTime / totalTime) * 100);
          if (watchTimePercent > 3)
            updateTimeWatched(activeEP.tv_id, watchTimePercent);
        }
      }, 500);
    };
    if (playerRef.current) {
      playerRef.current?.on("timeupdate", handleTimeUpdate);
    }

    return () => {
      if (watchTimeTimeoutRef.current) {
        clearTimeout(watchTimeTimeoutRef.current);
      }
    };
  }, [playerRef]);

  return <div id="oplayer" className="mx-auto mb-10  aspect-video  w-full " />;
}
