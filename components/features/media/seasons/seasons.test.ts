import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Seasons ordering and labeling', () => {
	it('sorts regular seasons ascending and places season 0 (Specials) last', () => {
		const seasons = [
			{ season_number: 3, name: 'Season 3' },
			{ season_number: 0, name: 'Specials' },
			{ season_number: 1, name: 'Season 1' },
			{ season_number: 2, name: 'Season 2' },
		];

		const regular = seasons
			.filter((s) => s.season_number > 0)
			.sort((a, b) => a.season_number - b.season_number);
		const specials = seasons.filter((s) => s.season_number === 0);
		const ordered = [...regular, ...specials];

		assert.deepEqual(
			ordered.map((s) => s.season_number),
			[1, 2, 3, 0]
		);
	});

	it('labels season 0 as SPECIALS and others as padded SEASON NN', () => {
		const formatLabel = (num: number) =>
			num === 0 ? 'SPECIALS' : `SEASON ${String(num).padStart(2, '0')}`;

		assert.equal(formatLabel(0), 'SPECIALS');
		assert.equal(formatLabel(1), 'SEASON 01');
		assert.equal(formatLabel(9), 'SEASON 09');
		assert.equal(formatLabel(12), 'SEASON 12');
	});

	it('detects generic "Episode N" titles to avoid redundant title rendering', () => {
		const isGenericTitle = (name?: string) =>
			!name || /^Episode\s+\d+$/i.test(name.trim());

		assert.equal(isGenericTitle('Episode 1'), true);
		assert.equal(isGenericTitle('Episode 12'), true);
		assert.equal(isGenericTitle('episode 4'), true);
		assert.equal(isGenericTitle('Ozymandias'), false);
		assert.equal(isGenericTitle('Episode 1: The Beginning'), false);
		assert.equal(isGenericTitle(''), true);
	});
});
