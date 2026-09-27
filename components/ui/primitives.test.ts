import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseTitleParts } from './title-display';
import { CURVES, TIMINGS, cardRiseDelay, isReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

describe('twMerge customization in cn', () => {
	it('preserves text-display font size alongside text color', () => {
		const merged = cn('m-0 text-balance break-anywhere tracking-normal', 'text-display-1', 'font-display uppercase text-text');
		assert.match(merged, /\btext-display-1\b/);
		assert.match(merged, /\btext-text\b/);
	});

	it('preserves all custom font size roles with color tokens', () => {
		assert.match(cn('text-display-2 text-dim'), /\btext-display-2\b/);
		assert.match(cn('text-display-2 text-dim'), /\btext-dim\b/);
		assert.match(cn('text-display-3 text-brand'), /\btext-display-3\b/);
		assert.match(cn('text-display-3 text-brand'), /\btext-brand\b/);
	});
});

describe('TitleDisplay parseTitleParts', () => {
	it('assigns text-display-1 to titles up to 14 characters', () => {
		const result = parseTitleParts('Severance');
		assert.equal(result.tierClass, 'text-display-1');
		assert.equal(result.tierModifier, '');
		assert.equal(result.main, 'Severance');
		assert.equal(result.subtitle, '');
		assert.equal(result.isNonLatin, false);
	});

	it('assigns text-display-1-long to titles from 15 to 28 characters', () => {
		const result = parseTitleParts('Better Call Saul');
		assert.equal(result.tierClass, 'text-display-1-long');
		assert.equal(result.tierModifier, 'is-long');
		assert.equal(result.main, 'Better Call Saul');
		assert.equal(result.subtitle, '');
		assert.equal(result.isNonLatin, false);
	});

	it('assigns text-display-1-extended to titles from 29 to 48 characters', () => {
		const result = parseTitleParts('The Extraordinary Attorney Woo: Subtitle Here');
		assert.equal(result.tierClass, 'text-display-1-extended');
		assert.equal(result.tierModifier, 'is-extended');
		assert.equal(result.main, 'The Extraordinary Attorney Woo');
		assert.equal(result.subtitle, 'Subtitle Here');
	});

	it('assigns text-display-1-maximum to titles over 48 characters', () => {
		const longTitle = 'Supercalifragilisticexpialidocious Ultra Long Title In Existence';
		const result = parseTitleParts(longTitle);
		assert.equal(result.tierClass, 'text-display-1-maximum');
		assert.equal(result.tierModifier, 'is-maximum');
	});

	it('splits subtitles on colon-space and en-dash-space', () => {
		const colonSplit = parseTitleParts('Spider-Man: Brand New Day');
		assert.equal(colonSplit.main, 'Spider-Man');
		assert.equal(colonSplit.subtitle, 'Brand New Day');

		const dashSplit = parseTitleParts('Dune – Part Two');
		assert.equal(dashSplit.main, 'Dune');
		assert.equal(dashSplit.subtitle, 'Part Two');
	});

	it('detects non-Latin scripts accurately', () => {
		const korean = parseTitleParts('기생충');
		assert.equal(korean.isNonLatin, true);

		const japanese = parseTitleParts('千と千尋の神隠し');
		assert.equal(japanese.isNonLatin, true);

		const english = parseTitleParts('Parasite');
		assert.equal(english.isNonLatin, false);
	});
});

describe('Motion tokens and helpers', () => {
	it('exports the decided vocabulary curves', () => {
		assert.equal(CURVES.enter, 'power4.out');
		assert.equal(CURVES.exit, 'power2.in');
		assert.equal(CURVES.move, 'power3.inOut');
		assert.equal(CURVES.touch, 'ease-out');
		assert.equal(CURVES.time, 'none');
	});

	it('exports timings matching MOTION.md', () => {
		assert.equal(TIMINGS.enter, 0.45);
		assert.equal(TIMINGS.exit, 0.18);
		assert.equal(TIMINGS.move, 0.55);
		assert.equal(TIMINGS.touch, 0.15);
	});

	it('calculates card rise delay capped at 8 items', () => {
		assert.equal(cardRiseDelay(0), 0.18);
		assert.equal(cardRiseDelay(1), 0.18 + 0.045);
		assert.equal(cardRiseDelay(8), 0.18 + 8 * 0.045);
		assert.equal(cardRiseDelay(12), 0.18 + 8 * 0.045);
	});

	it('handles isReducedMotion safely in Node environment', () => {
		assert.equal(isReducedMotion(), false);
	});
});
