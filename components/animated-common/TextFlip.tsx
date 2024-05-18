export function TextGlitch({ children }: { children: any }) {
  return (
    <div className="relative overflow-hidden group">
      <span className="invisible">{children}</span>
      <span className=" absolute top-0 left-0 group-hover:-translate-y-full transition-transform ease-in-out duration-500 hover:duration-300">
        {children}
      </span>
      <span className=" absolute top-0 left-0 translate-y-full group-hover:translate-y-0 transition-transform ease-in-out duration-500 hover:duration-300">
        {children}
      </span>
    </div>
  );
}
