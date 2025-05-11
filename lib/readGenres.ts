import * as fs from 'fs';
import path from 'path';
export const genreData = JSON.parse(
	fs.readFileSync(path.join(process.cwd(), 'public/genre.json'), 'utf-8')
);
