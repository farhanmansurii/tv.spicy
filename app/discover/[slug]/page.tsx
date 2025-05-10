import CommonContainer from '@/components/container/CommonContainer';
import LoadMore from '@/components/container/LoadMore';
import Head from 'next/head';
import React from 'react';

export default function Page(params: any) {
	return (
		params.searchParams.title && (
			<>
				<Head>
					<title>{params.searchParams.title}</title>
					<meta name="description" content="Watch any TV / Movies / Anime with Watvh" />
				</Head>
				<CommonContainer>
					<h1 className="text-8xl  tracking-tight lowercase text-foreground">
						{params.searchParams.title}
						{params.searchParams.type.toLowerCase() === 'movie'
							? ' Movies '
							: ' TV'}{' '}
					</h1>
					<div className="mb-[4rem] min-h-screen flex  gap-[3rem] flex-col mx-auto">
						<LoadMore params={params} />
					</div>
				</CommonContainer>
			</>
		)
	);
}
