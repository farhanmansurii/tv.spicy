import { Show } from '@/lib/types';
import React from 'react';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';
import MoreInfoComponent from '../common/MoreInfoComponent';
const RelatedShowsComponent = dynamic(() => import('../container/RelatedShowContainer'), {
  ssr: false,
});
export default function MoreDetailsContainer(props: {
  show: Show;
  type: string;
}) {
  return (
    <Tabs
      className="flex pb-[7rem]  pt-10 bg-muted w-full  flex-col"
      defaultValue="info"
    >
      <div className="mb-6  w-[96%] mx-auto">
        <TabsList className="w-full flex justify-start ">
          <TabsTrigger className='w-[40%] h-10 ' value="info">Info </TabsTrigger>
          <TabsTrigger className='w-[40%] h-10' value="recommendations">
           <span>Recommendations</span>
            </TabsTrigger>
          <TabsTrigger className='w-[40%] h-10' value="similar">Similar </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent className="w-[90%] md:w-[96%] mx-auto" value="info">
        <MoreInfoComponent type={props.type} show={props.show} />
      </TabsContent>
      <TabsContent value="similar">
        <RelatedShowsComponent
          relation="similar"
          type={props.type}
          show={props.show}
        />
      </TabsContent>
      <TabsContent value="recommendations">
        <RelatedShowsComponent
          relation="recommendations"
          type={props.type}
          show={props.show}
        />
      </TabsContent>
    </Tabs>
  );
}
