import Link from "next/link";
import { Skeleton } from "../ui/skeleton";

function Card(props:any) {
  const { data, type } = props;

  return (
    <Link key={data.id} href={`/${type}/${data.id}`}>
      <div className="flex-none  hover:z-10 -z-10  md:hover:scale-105 md:hover:shadow-2xl overscroll-y-none duration-200   h-58 md:h-72 w-32 md:w-48">
          <img
            className="object-cover  "
            src={`https://image.tmdb.org/t/p/w500${data.poster_path}` || data.image}
            alt={data.title}
          />
      </div>
    
    </Link>
  );
}

export default Card;
