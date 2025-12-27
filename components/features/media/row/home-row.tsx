'use client';

import { fetchRowData } from '@/lib/api';
import MediaRow from './media-row';
import RowLoader from '@/components/shared/loaders/row-loader';
import { useInView } from 'react-intersection-observer';
import { useQuery } from '@tanstack/react-query';
import { useHasMounted } from '@/hooks/use-has-mounted';

interface HomeRowProps {
  endpoint: string;
  text: string;
  type: string;
  viewAllLink?: string;
  showRank?: boolean;
  initialData?: any[];
}

export function HomeRow({ endpoint, text, type, viewAllLink, showRank = false, initialData }: HomeRowProps) {
  const hasMounted = useHasMounted();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 });

  const queryKey = ['homepage', endpoint, type];
  const shouldFetch = hasMounted && inView && !!endpoint && !initialData;

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: async () => fetchRowData(endpoint),
    enabled: shouldFetch,
    initialData: initialData,
    staleTime: 1000 * 60 * 60 * 24, // 24h
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7d
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const displayData = initialData || data;

  if (isLoading || isFetching) {
    return (
      <div ref={ref}>
        <RowLoader withHeader />
      </div>
    );
  }

  if (error) {
    console.error('Error fetching data:', error);
    return null;
  }

  return (
    <div ref={ref}>
      {Array.isArray(displayData) && displayData.length > 0 ? (
        <MediaRow
          text={text}
          shows={showRank ? displayData.slice(0, 10) : displayData}
          type={type}
          viewAllLink={viewAllLink}
        />
      ) : (
        <RowLoader withHeader />
      )}
    </div>
  );
}
