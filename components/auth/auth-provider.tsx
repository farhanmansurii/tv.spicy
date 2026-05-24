'use client';

import { ReactNode } from 'react';
import { AuthSync } from './auth-sync';

/**
 * Auth provider wrapper.
 *
 * Mounts AuthSync (db/local sync) and provides the auth context tree.
 * Better Auth itself doesn't need a provider, but we use this shell
 * to keep auth-related side effects in one place.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
	return (
		<>
			<AuthSync />
			{children}
		</>
	);
}
