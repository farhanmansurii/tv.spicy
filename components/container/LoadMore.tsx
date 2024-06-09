'use client';

import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import { fetchGenreById } from '@/lib/utils';
import { Show } from '@/lib/types';
import { Loader2, Loader2Icon } from "lucide-react";
import Row from "./Row";
import GridLoader from "../loading/GridLoader";

let page = 1;

function LoadMore(props: { params: any }) {
  const { params } = props;
  const { ref, inView } = useInView();

  const [data, setData] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (inView) {
      setIsLoading(true);
      const delay = 500;

      const timeoutId = setTimeout(
        async () => {
          await fetchGenreById(
            params?.searchParams.type,
            params?.searchParams.id,
            page
          ).then((res) => {
            setData([...data, ...res]);
            page++;
          });
          setIsLoading(false);
        },
        page === 1 ? 0 : delay
      );

      // Clear the timeout if the component is unmounted or inView becomes false
      return () => clearTimeout(timeoutId);
    }
  }, [inView, data, isLoading, params]);

  return (
    <div className="spacy-y-10">
      <Row
        isVertical={true}
        showRank={false}
        text=""
        shows={data}
        type={params.searchParams.type}
      />
      <div ref={ref}>{inView && isLoading && <GridLoader />}</div>
    </div>
  );
}

export default LoadMore;
