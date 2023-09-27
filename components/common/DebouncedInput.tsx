import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, type InputProps } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DebouncedInputProps<TData extends object>
  extends Omit<InputProps, "onChange"> {
  containerClassName?: string;
  value: string;
  onChange: (value: string) => void;
  setQuery: (query: string) => void;
  setData: (data: TData[]) => void;
  debounce?: number;
}

export function DebouncedInput<TData extends object>({
  id = "query",
  containerClassName,
  value: initialValue,
  onChange,
  setData,
  setQuery,
  debounce = 1000,
  className,
  ...props
}: DebouncedInputProps<TData>) {
  const [value, setValue] = React.useState(initialValue);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // handle debouncing
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setQuery("");
        setData([]);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        if (!inputRef.current) return;
        e.preventDefault();
        inputRef.current.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setData, setQuery]);

  return (
    <div className={("relative w-full")}>
      <div className="flex border-0 w-full items-center  px-3" cmdk-input-wrapper="">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          ref={inputRef}
          id={id}
          type="text"
          className={
            "flex h-11 w-full border-0 ring-transparent focus:outline-none rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          }
          
          value={value}
          onChange={(e) => setValue(e.target.value)}
          {...props}
        />
      </div>
    </div>
  );
}
