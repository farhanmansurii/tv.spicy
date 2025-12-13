'use client';
import React, { useEffect, useRef } from 'react';

interface SafeVideoFrameProps {
	url: string;
}

const SafeIFrame: React.FC<SafeVideoFrameProps> = ({ url }) => {
	const iframeRef = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		const iframe = iframeRef.current;
		if (!iframe) return;

		const handleNavigation = (event: Event) => {
			event.preventDefault();
		};

		const handleLoad = () => {
			const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
			if (!iframeDocument) return;
			iframeDocument.addEventListener('click', handleNavigation, true);
		};

		iframe.addEventListener('load', handleLoad);

		return () => {
			iframe.removeEventListener('load', handleLoad);
			const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
			if (!iframeDocument) return;
			iframeDocument.removeEventListener('click', handleNavigation, true);
		};
	}, [url]);

	return (
		<iframe
			ref={iframeRef}
			allowFullScreen
			className="w-full h-full aspect-video font-mono"
			src={url}
		/>
	);
};

export default SafeIFrame;
