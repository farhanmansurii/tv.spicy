import * as React from 'react';

const DEFAULT_OPTIONS: MutationObserverInit = {
	attributes: true,
	characterData: true,
	childList: true,
	subtree: true,
};

export const useMutationObserver = (
	ref: React.RefObject<HTMLElement | null>,
	callback: MutationCallback,
	options: MutationObserverInit = DEFAULT_OPTIONS
) => {
	const callbackRef = React.useRef(callback);
	const optionsRef = React.useRef(options);

	React.useLayoutEffect(() => {
		callbackRef.current = callback;
		optionsRef.current = options;
	});

	React.useEffect(() => {
		if (ref.current) {
			const observer = new MutationObserver((...args) => callbackRef.current(...args));
			observer.observe(ref.current, optionsRef.current);
			return () => observer.disconnect();
		}
	}, [ref]);
};
