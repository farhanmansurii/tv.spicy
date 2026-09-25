/**
 * Single source of truth for the hero block height. The route skeleton in
 * app/loading.tsx imports this so it reserves exactly what the hero occupies
 * and the swap cannot shift the rows below it.
 */
export const HERO_HEIGHT_CLASS =
	'h-[62dvh] min-h-[430px] max-h-[620px] md:h-[72dvh] md:min-h-[540px] lg:max-h-[760px]';
