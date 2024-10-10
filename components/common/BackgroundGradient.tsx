import React from 'react';

export const BackgroundGradient = () => {
	return (
		<div
			className="absolute top-0 z-[-2] h-screen w-screen bg-background
      bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.5),transparent)]
      dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.35),transparent)]
      redLight:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.5),transparent)]
      redDark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.55),transparent)]"
		></div>
	);
};
