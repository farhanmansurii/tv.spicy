import { fetchRowData } from "@/lib/utils";
import React from "react";
import FetchAndRenderRow from "./FetchAndRenderRow";
import { Skeleton } from "../ui/skeleton";
import GridLoader from "../loading/GridLoader";

export default function RelatedShowsComponent(props: {
  show: any;
  type: string;
  relation: string;
}) {

  return (
    <>
      <FetchAndRenderRow
        apiEndpoint={`/${props.type}/${props.show.id}/${props.relation}`}
        showRank={false}
        text=""
        type="tv"
        isVertical={true}
      />
    </>
  );
}
