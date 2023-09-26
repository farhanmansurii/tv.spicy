import { fetchRowData } from "@/lib/utils";
import Row from "./Row";

interface AnimeListProps {
  endpoint: string;
  text: string;
}

export default async function MovieList(props: AnimeListProps) {
  const data = await fetchRowData('discover');
  return <Row text={props.text} type={data} />;
}
