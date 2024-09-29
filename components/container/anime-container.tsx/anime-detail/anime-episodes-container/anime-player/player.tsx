"use client";
import React, { useEffect, useRef, useState } from "react";
import Player from "@oplayer/core";
import OUI from "@oplayer/ui";
import OHls from "@oplayer/hls";
import { AnimeEpisode } from "@/lib/types";

type Ctx = {
  ui: ReturnType<typeof OUI>;
  hls: ReturnType<typeof OHls>;
};

export default function OPlayer({
  sources,
  episode,
  animeID,
  malId,
  handleNextEpisode,
}: {
  sources: any;
  episode: AnimeEpisode;
  animeID: string;
  malId: string;
  handleNextEpisode: any;
}) {
  const playerRef = useRef<Player<Ctx>>();

  const plugins = [
    OUI({
      fullscreen: true,
      coverButton: true,
      miniProgressBar: true,
      forceLandscapeOnFullscreen: true,
      screenshot: false,
      pictureInPicture: false,
      showControls: "always",
      theme: { primaryColor: "#00C02F" },
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
          type: "selector",

          icon: ` <svg
            viewBox="0 0 24 24"
            fill="currentColor"
         className='w-7 h-7 '
          >
            <path d="M14.5 13.5h2v-3h-2M18 14a1 1 0 01-1 1h-.75v1.5h-1.5V15H14a1 1 0 01-1-1v-4a1 1 0 011-1h3a1 1 0 011 1m-7 5H9.5v-2h-2v2H6V9h1.5v2.5h2V9H11m8-5H5c-1.11 0-2 .89-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
          </svg>`,
          children: sources.map((source: any) => ({
            name: source.quality,
            value: source.url,
            default: source.quality === "default",
          })),
          onChange({ value }) {
            const oplayer = playerRef.current;
            if (!oplayer) return;
            oplayer.changeSource({ src: value });
          },
        },
        {
          key: "KEY",
          type: "switcher", // or 'switcher'
          name: "Skip intro/outro",
          //   default: autoSkipOP,
          //   onChange: ({ value }) => {
          //     toggleAutoSkipOP();
          //   },
        },
      ],
    }),
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
        src: sources[0].url,
      })
      .then(() =>
        fetch(
          `https://api.aniskip.com/v2/skip-times/${malId}/${episode.number}?types=op&types=recap&types=mixed-op&types=ed&types=mixed-ed&episodeLength=0`
        )
          .then((res) => res.json())
          .then(
            (res: {
              statusCode: number;
              results: {
                skipType: string;
                interval: { startTime?: number; endTime?: number };
              }[];
            }) => {
              const highlights: { time: number; text: string }[] = [];
              let opDuration: number[] = [];
              let edDuration: number[] = [];

              if (res.statusCode === 200) {
                for (let result of res.results) {
                  if (result.skipType === "op" || result.skipType === "ed") {
                    const { startTime, endTime } = result.interval;

                    if (startTime !== undefined) {
                      highlights.push({
                        time: startTime,
                        text: result.skipType === "op" ? "OP" : "ED",
                      });
                      if (result.skipType === "op") opDuration.push(startTime);
                      else edDuration.push(startTime);
                    }

                    if (endTime !== undefined) {
                      highlights.push({
                        time: endTime,
                        text: result.skipType === "op" ? "OP" : "ED",
                      });
                      if (result.skipType === "op") opDuration.push(endTime);
                      else edDuration.push(endTime);
                    }
                  }
                }
              }

              oplayer?.emit("opedchange", [opDuration, edDuration]);
              oplayer?.context.ui.changHighlightSource(highlights);
              //   oplayer?.on(["timeupdate", "seeked"], () => {
              //     if (
              //       oplayer.currentTime >= opDuration[0] &&
              //       oplayer.currentTime < opDuration[1] &&
              //       autoSkipOP
              //     ) {
              //       oplayer.seek(opDuration[1]);
              //     }
              //     if (
              //       oplayer.currentTime >= edDuration[0] &&
              //       oplayer.currentTime < edDuration[1] &&
              //       autoSkipOP
              //     ) {
              //       oplayer.seek(edDuration[1]);
              //     }
              //   });
              oplayer?.on("ended", () => handleNextEpisode());
            }
          )
          .catch((err) => console.error("Error fetching skip times:", err))
      )
      .catch((err) => console.error("Error changing source:", err));
    oplayer.on("next", () => {
      handleNextEpisode();
    });
  }, [sources, animeID, malId]);

  return <div id="oplayer" className="aspect-video " />;
}
