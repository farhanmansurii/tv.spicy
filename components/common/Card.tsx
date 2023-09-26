import Link from "next/link";
import { Button } from "../ui/button";

function Card(props: any) {
  const { data, type } = props;
  return (
    <Link key={data.id} href={`/${type}/${data.id}`}>
      <div className="flex-none w-32 lg:w-44">
        <div className="relative">
          <img
            className="object-cover w-full h-48 lg:h-56"
            src={`https://image.tmdb.org/t/p/w500${data.poster_path}`}
            alt={data.title}
          />
          <div className="absolute inset-0 p-3 bg-black/30 w-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <Button size="xs" className="  ">
                {new Date(data.release_date).getFullYear() ||
                  new Date(data.first_air_date).getFullYear()}
              </Button>
              <Button size="xs" className="  ">
                {data.vote_average}
              </Button>
            </div>
            <h1 className="text-white text-sm lg:text-lg">
              {data.title || data.name}
            </h1>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default Card;
