import { useMediaQuery } from '@/store/mediaQueryStore';

/**
 * @deprecated Use `useMediaQuery()` from `@/store/mediaQueryStore` instead.
 * Kept for backward compatibility with shadcn/ui Sidebar.
 */
export function useIsMobile() {
	return useMediaQuery();
}
