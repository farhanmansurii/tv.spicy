import Link from "next/link";

function Card(props: any) {
  const { data, type } = props;

  return (
    <Link key={data.id} href={`/${type}/${data.id}`}>
      {/* <div className="flex-none  hover:z-10  -z-10 bg-secondary/70  md:hover:scale-105 md:hover:shadow-2xl overscroll-y-none duration-200   h-58 md:h-72 w-32 md:w-48">
          <img
            className="object-cover  "
            src={`https://image.tmdb.org/t/p/w500${data.backdrop_path}` || data.image}
            alt={data.title}
          />
      </div> */}
      <div className="flex-none  hover:z-10  -z-10 bg-secondary/70  md:hover:scale-105 md:hover:shadow-2xl overscroll-y-none duration-200  w-72 rounded-xl ">
        <img
          className="object-cover rounded  "
          src={
            `https://image.tmdb.org/t/p/w500${data.backdrop_path}` || data.image
          }
          alt={data.title}
        />
      </div>
      <div>{data.title || data.name}</div>
    </Link>
  );
}

export default Card;
