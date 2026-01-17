export type StreamingProvider = 'vidsrc' | 'susflix' | 'consumet';

export interface StreamingSource {
	url: string;
	quality?: string;
	name?: string;
	isM3U8?: boolean;
}

export interface StreamingSubtitle {
	url: string;
	lang?: string;
	label?: string;
}

export interface StreamingLinksResponse {
	sources: StreamingSource[];
	subtitles?: StreamingSubtitle[];
	provider?: StreamingProvider;
}
