"use client";
import RowLoader from "@/components/loading/RowLoader";
import { fetchData } from "@/lib/anime-helpers";
import { useQuery } from "@tanstack/react-query";
import AnimeRow from "./anime-row";

interface AnimeListProps {
  endpoint: string;
  text: string;
}

export default function AnimeRowContainer(props: AnimeListProps) {
  const { endpoint, text } = props;
  const { data: animedata, isLoading } = useQuery({
    queryKey: ["animeRow", endpoint],
    queryFn: () => fetchData(props.endpoint),
    refetchInterval: 1000 * 60 * 100,
  });
  if (isLoading) return <RowLoader withHeader />;
  return (
    <AnimeRow
      anime={animedata.results}
      text={text}
      isVertical={false}
      type="tv"
    />
  );
}
