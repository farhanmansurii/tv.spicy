import Link from "next/link";

function Card(props:any) {
  const { data, type } = props;

  return (
    <Link key={data.id} href={`/${type}/${data.id}`}>
      <div className="flex-none w-32 hover:z-10 -z-10 py-5 md:hover:scale-105 md:hover:shadow-2xl overscroll-y-none duration-200 lg:w-44">
        <div className="relative">
          <img
            className="object-cover w-full "
            src={`https://image.tmdb.org/t/p/w500${data.poster_path}`}
            alt={data.title}
          />
        </div>
      </div>
    </Link>
  );
}

export default Card;
