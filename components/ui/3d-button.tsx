const ThreeDButton = (props) => {
  return (
    <button className="group relative m-1 w-full inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border-b-2 border-l-2 border-r-2 border-primary/50 bg-gradient-to-tr from-primary/60 to-primary px-4 py-1 text-white shadow-lg transition duration-100 ease-in-out active:translate-y-0.5 active:border-red-600 active:shadow-none">
      <span className="absolute h-0 w-0 rounded-full bg-white opacity-10 transition-all duration-300 ease-out group-hover:h-32 group-hover:w-32"></span>
      <span className="relative -medium font-xs">{props.text}</span>
    </button>
  );
};

export default ThreeDButton;
