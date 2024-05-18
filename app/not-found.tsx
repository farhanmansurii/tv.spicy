import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="w-full p-4 bg-muted gap-4 h-screen flex items-center justify-center flex-col border">
      <h2 className="text-4xl text-center">
        there was some oopsies in the request, please try again later :/
      </h2>
      <Link href="/">
        <Button size={"lg"}>Go to Home for now</Button>
      </Link>
    </div>
  );
}
