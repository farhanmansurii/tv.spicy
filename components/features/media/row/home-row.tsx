'use client';

import { fetchRowData } from '@/lib/api';
import MediaRow from './media-row';
import RowLoader from '@/components/shared/loaders/row-loader';
import { useInView } from 'react-intersection-observer';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface HomeRowProps {
  endpoint: string;
  text: string;
  type: string;
  viewAllLink?: string;
  showRank?: boolean;
  initialData?: any[];
}

export function HomeRow({ endpoint, text, type, viewAllLink, showRank = false, initialData }: HomeRowProps) {
  // Use useState with consistent initial value to prevent hydration mismatch
  const [hasMounted, setHasMounted] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 });

  useEffect(() => {
    setHasMounted(true);
  }, []);

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

  // Show loader if:
  // 1. Query is loading/fetching, OR
  // 2. No initialData and component hasn't mounted yet (to ensure server/client consistency)
  // 3. No data available
  const hasData = initialData || data;
  const shouldShowLoader = isLoading || isFetching || (!initialData && !hasMounted) || !hasData;

  if (shouldShowLoader) {
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

  const displayData = initialData || data;

  // Double-check we have valid data before rendering
  if (!Array.isArray(displayData) || displayData.length === 0) {
    return (
      <div ref={ref}>
        <RowLoader withHeader />
      </div>
    );
  }

  return (
    <div ref={ref}>
      <MediaRow
        text={text}
        shows={showRank ? displayData.slice(0, 10) : displayData}
        type={type}
        viewAllLink={viewAllLink}
      />
    </div>
  );
}
