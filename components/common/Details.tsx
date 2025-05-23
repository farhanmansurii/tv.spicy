'use client';
import React from 'react';
import { Separator } from '../ui/separator';
import ShowContainer from './ShowContainer';
import MoreDetailsContainer from '../container/MoreDetailsContainer';
import ShowDetails from '../container/tv-details.tsx/TVDetails';
import CommonContainer from '../container/CommonContainer';

const Details = (props: any) => {
	const { data, type, id } = props;

	return (
		<CommonContainer className=" w-full space-y-5 ">
			<ShowDetails id={data?.id} show={data} language={'en'} type={type} />
			<ShowContainer id={data?.id} type={type} seasons={data.seasons} />
			<Separator className="max-w-4xl w-full  mx-auto" />
			<MoreDetailsContainer type={type} show={data} />
		</CommonContainer>
	);
};
export default Details;
