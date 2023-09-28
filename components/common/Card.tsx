import Link from "next/link";

function Card(props) {
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
          <div className="absolute inset-0 p-3 bg-black/30 w-full flex flex-col justify-between">
            {/* Your content */}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default Card;
