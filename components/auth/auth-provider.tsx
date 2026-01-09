'use client';

import { ReactNode } from 'react';

export function AuthProvider({ children }: { children: ReactNode }) {
	// Better Auth doesn't need a provider wrapper
	return <>{children}</>;
}
