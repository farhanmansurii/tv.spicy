import { fetchRowData } from '@/lib/api';
import MediaRow from '../row/media-row';

interface AnimeListProps {
	endpoint: string;
	text: string;
}

export default async function MovieList(props: AnimeListProps) {
	const data = await fetchRowData('discover');
	return <MediaRow text={props.text} type={data} />;
}
