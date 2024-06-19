"use client";
import { cn, fetchGenreById, fetchRowData } from "@/lib/utils";
import Row from "./Row";
import { useQuery } from "@tanstack/react-query";
import RowLoader from "../loading/RowLoader";
import { Loader2Icon } from "lucide-react";
import GridLoader from "../loading/GridLoader";

import { useInView } from "react-intersection-observer";
interface FetchAndRenderRowProps {
  apiEndpoint?: any;
  text: string;
  showRank: boolean;
  type: string;
  isVertical?: boolean;
  isGenre?: boolean;
}

const FetchAndRenderRow: React.FC<FetchAndRenderRowProps> = ({
  apiEndpoint,
  text,
  showRank,
  type,
  isGenre = false,
  isVertical = false,
}) => {
  const { ref, inView } = useInView();

  const { data: rowData, isLoading } = useQuery({
    queryKey: ["movies", apiEndpoint],
    queryFn: async () =>
      isGenre
        ? await fetchGenreById(apiEndpoint.type, apiEndpoint.id, 1)
        : await fetchRowData(apiEndpoint),
    refetchInterval: 1000 * 60 * 100,
    enabled: isGenre ? inView : true,
  });

  if (isLoading) {
    return isVertical ? <GridLoader /> : <RowLoader withHeader={true} />;
  }

  return (
    <div ref={ref}>
      {rowData && rowData.length > 0 ? (
        <Row
          isVertical={isVertical}
          text={text}
          shows={showRank ? rowData.slice(0, 10) : rowData}
          type={type}
          showRank={showRank}
        />
      ) : isVertical ? (
        <GridLoader />
      ) : (
        <RowLoader withHeader={true} />
      )}
    </div>
  );
};

export default FetchAndRenderRow;
