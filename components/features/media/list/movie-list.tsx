import { fetchRowData } from '@/lib/api';
import MediaRow from '../row/media-row';

interface MovieListProps {
	endpoint: string;
	text: string;
}

export default async function MovieList(props: MovieListProps) {
	const data = await fetchRowData(props.endpoint);
	return <MediaRow text={props.text} type="movie" shows={data as any} />;
}
