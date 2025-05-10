import { Loader2 } from 'lucide-react';
import React from 'react';

export default function Loading() {
	return (
		<div className="flex justify-center items-center h-screen">
			<Loader2 className="w-10 h-10 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin" />
		</div>
	);
}
