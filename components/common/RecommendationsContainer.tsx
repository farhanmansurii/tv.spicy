import { fetchRecommendations } from "@/lib/utils";
import React from "react";
import Row from "../container/Row";
interface RecommendationsContainerProps {
  type: string;
  id: string;
}
export default async function RecommendationsContainer(
  props: RecommendationsContainerProps
) {
  const { type, id } = props;
  const recommendations = await fetchRecommendations(
    id,
    type,
    "recommendations"
  );
  const similar = await fetchRecommendations(id, type, "similar");
  return (
    <>
      <Row text="Recommendations" type={type} shows={recommendations?.results} />
      <Row text="Similar" type={type} shows={similar?.results} />
    </>
  );
}
