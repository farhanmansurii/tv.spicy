'use client';

import Container from '@/components/shared/containers/container';
import SectionWrapper from '@/components/shared/animated/section-layout';
import CommonTitle from '@/components/shared/animated/common-title';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
	return (
		<div className="min-h-screen mt-20">
			<Container>
				<SectionWrapper spacing="large" className="pb-4">
					<div className="max-w-4xl space-y-6">
						<div className="space-y-2">
							<CommonTitle text="Error" variant="section" spacing="none" />
							<CommonTitle text="404" variant="large" as="h1" className="text-white" />
						</div>
						<p className="text-lg md:text-xl text-zinc-500 font-medium leading-relaxed max-w-2xl">
							The page you're looking for doesn't exist or has been moved.
							Let's get you back on track.
						</p>
					</div>
				</SectionWrapper>

				<SectionWrapper spacing="medium">
					<div className="flex flex-col sm:flex-row gap-4 max-w-md">
						<Link href="/" className="flex-1">
							<Button
								variant="default"
								size="lg"
								className="w-full group bg-white text-black hover:bg-white/90"
							>
								<Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
								Go Home
							</Button>
						</Link>
						<Button
							variant="outline"
							size="lg"
							className="flex-1 group border-white/10 hover:bg-white/5"
							onClick={() => window.history.back()}
						>
							<ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
							Go Back
						</Button>
					</div>
				</SectionWrapper>
			</Container>
		</div>
	);
}
