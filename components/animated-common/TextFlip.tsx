export function TextGlitch({ children }: { children: any }) {
  return (
    <div className="relative normal-case overflow-hidden group">
      <span className="invisible  line-clamp-1">{children}</span>
      <span className=" line-clamp-1 absolute top-0 left-0 group-hover:-translate-y-full transition-transform ease-in-out duration-500 hover:duration-300">
        {children}
      </span>
      <span className="  line-clamp-1 absolute top-0 left-0 translate-y-full group-hover:translate-y-0 transition-transform ease-in-out duration-500 hover:duration-300">
        {children}
      </span>
    </div>
  );
}
