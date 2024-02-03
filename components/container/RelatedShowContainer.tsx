import { fetchRowData } from "@/lib/utils";
import React from "react";
import { FetchAndRenderRow } from "./FetchAndRenderRow";

export default function RelatedShowsComponent(props: {
  show: any;
  type: string;
  relation: string;
}) {
  const similarShows = FetchAndRenderRow(
    `/${props.type}/${props.show.id}/${props.relation}`,
    "",
    false,
    "tv",
    true,
  );
  return similarShows;
}
