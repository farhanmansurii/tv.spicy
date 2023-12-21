import React from "react";
import MovieList from "./MovieList";
import PopularShows from "./PopularShows";
import CarousalComponent from '../common/CarousalComponent';
import { Carousal } from '../common/Carousal';

export default  function HomePage() {
  return (
    <div className="flex gap-1 flex-col">
      <PopularShows />
    </div>
  );
}
