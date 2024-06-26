"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

function updateSearchParam({
  key,
  value,
}: {
  key: string;
  value: string;
}): string {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (value) {
    // set the search parameter if value is not empty
    params.set(key, value);
  } else {
    params.delete(key);
  }
  return `${pathname}?${params.toString()}`;
}

function updateSearchParamForCurrentPage({
  key,
  value,
}: {
  key: string;
  value: string;
}) {
  const { replace } = useRouter();

  const newUrl = updateSearchParam({ key, value });
  replace(newUrl);
}
