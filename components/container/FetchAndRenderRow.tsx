"use client";
import { cn, fetchRowData } from "@/lib/utils";
import Row from "./Row";
import { useQuery } from "@tanstack/react-query";
import RowLoader from "../loading/RowLoader";
import { Loader2Icon } from "lucide-react";

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
    return isVertical ? (
      <div className="w-full text-xl flex-col text-primary flex h-full aspect-video items-center text-center justify-center">
        <Loader2Icon className="animate-spin  w-10 h-10 duration-1000 text-primary" />
        <div>Loading</div>
      </div>
    ) : (
      <RowLoader withHeader={true} />
    );
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
