'use client';

import { useState, useEffect } from 'react';


export function useMediaQuery(query: string): boolean {
    // 1. Initialize with false (or a sensible default for SSR)
    const [matches, setMatches] = useState<boolean>(false);

    useEffect(() => {
        // 2. Create the media query list
        const media = window.matchMedia(query);

        // 3. Set initial state based on current window size
        if (media.matches !== matches) {
            setMatches(media.matches);
        }

        // 4. Define listener to update state on resize
        const listener = () => setMatches(media.matches);

        // 5. Add listener (using modern addEventListener)
        media.addEventListener('change', listener);

        // 6. Cleanup on unmount
        return () => media.removeEventListener('change', listener);
    }, [query, matches]);

    return matches;
}
