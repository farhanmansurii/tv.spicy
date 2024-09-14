"use client";

import { fetchGenreById, fetchRowData } from "@/lib/utils";
import Row from "./Row";
import RowLoader from "../loading/RowLoader";
import GridLoader from "../loading/GridLoader";
import { useInView } from "react-intersection-observer";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback, useState } from "react";

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
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const queryClient = useQueryClient();
  const [isInitialRender, setIsInitialRender] = useState(true);

  const fetcher = useCallback(async () => {
    console.log(`[${new Date().toISOString()}] Fetching data for ${text}`);
    if (isGenre) {
      return await fetchGenreById(apiEndpoint.type, apiEndpoint.id, 1);
    }
    return await fetchRowData(apiEndpoint);
  }, [apiEndpoint, isGenre, text]);

  const queryKey = ['movies', apiEndpoint];

  const { data: rowData, error, isLoading, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: fetcher,
    enabled: inView && !!apiEndpoint,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (inView && !!apiEndpoint && !isInitialRender) {
      const cachedData = queryClient.getQueryData(queryKey);
      if (cachedData) {
        console.log(`[${new Date().toISOString()}] Using cached data for ${text}`);
      } else {
        console.log(`[${new Date().toISOString()}] No cached data for ${text}, fetching...`);
        refetch();
      }
    }
    setIsInitialRender(false);
  }, [inView, apiEndpoint, queryClient, queryKey, text, refetch, isInitialRender]);

  useEffect(() => {
    if (rowData) {
      console.log(`[${new Date().toISOString()}] Data loaded for ${text}`);
    }
  }, [rowData, text]);

  if (isLoading || isFetching) {
    return isVertical ? <GridLoader /> : <RowLoader withHeader={true} />;
  }

  if (error) {
    console.error("Error fetching data:", error);
    return (
      <div>
        Error loading content.
        <button onClick={handleRefresh}>Retry</button>
      </div>
    );
  }

  return (
    <div ref={ref}>
      {rowData && rowData.length > 0 ? (
        <>
          <Row
            isVertical={isVertical}
            text={text}
            shows={showRank ? rowData.slice(0, 10) : rowData}
            type={type}
            showRank={showRank}
          />
        </>
      ) : isVertical ? (
        <GridLoader />
      ) : (
        <RowLoader withHeader={true} />
      )}
    </div>
  );
};

export default FetchAndRenderRow;
