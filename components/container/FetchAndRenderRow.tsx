"use client";
import { cn, fetchRowData } from "@/lib/utils";
import Row from "./Row";
import { useQuery } from "@tanstack/react-query";
import RowLoader from "../loading/RowLoader";
import { Loader2Icon } from "lucide-react";
import GridLoader from "../loading/GridLoader";

interface FetchAndRenderRowProps {
  apiEndpoint: string;
  text: string;
  showRank: boolean;
  type: string;
  isVertical?: boolean;
}

const FetchAndRenderRow: React.FC<FetchAndRenderRowProps> = ({
  apiEndpoint,
  text,
  showRank,
  type,
  isVertical = false,
}) => {
  const { data: rowData, isLoading } = useQuery({
    queryKey: ["movies", apiEndpoint],
    queryFn: () => fetchRowData(apiEndpoint),
    refetchInterval: 1000 * 60 * 100,
  });

  if (isLoading) {
    return isVertical ? <GridLoader /> : <RowLoader withHeader={true} />;
  }

  return rowData && rowData.length > 0 ? (
    <Row
      isVertical={isVertical}
      text={text}
      shows={showRank ? rowData.slice(0, 10) : rowData}
      type={type}
      showRank={showRank}
    />
  ) : (
    <div className="w-full h-[400px] items-center justify-center text-center flex text-2xl font-bold">
      No data found
    </div>
  );
};

export default FetchAndRenderRow;
