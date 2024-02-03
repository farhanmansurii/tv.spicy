'use client';

import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import { fetchGenreById } from '@/lib/utils';
import { Show } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import Row from './Row';

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
    <>
      <Row
        isVertical={true}
        showRank={false}
        text=""
        shows={data}
        type={params.searchParams.type}
      />
      <section className="flex justify-center items-center w-full">
        <div ref={ref}>
          {inView && isLoading && (
            <div className="  gap-2 ease-in-out duration-150 flex-col py-2 flex   items-center justify-center ">
              <Loader2 className=" animate-spin ease-linear" />
              <div>Loading </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default LoadMore;
