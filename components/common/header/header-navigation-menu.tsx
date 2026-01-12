'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

import { buildLanguageNavigation } from './header-navigation-data';
import { HeaderPopularMovie } from './header-popular-movie';
import { HeaderPopularTvSerie } from './header-popular-tv-serie';
import { NavigationMenu, NavigationMenuList } from '@/components/ui/navigation-menu';
// import { useAuth } from '@/context/auth'
// import { Bell } from 'lucide-react'

export const HeaderNavigationMenu = () => {
	const pathname = usePathname();

	// const { user } = useAuth()

	const getIsActive = (href: string) => {
		const normalizedPath = pathname.replace(`/`, '');
		return normalizedPath.includes(href);
	};

	return (
		<NavigationMenu>
			<NavigationMenuList>
				{/* {user && (
          <NavigationMenuItem
            className={cn(
              navigationMenuTriggerStyle(),
              getIsActive(`/${language}/notifications`) && 'bg-muted',
            )}
            asChild
          >
            <Link
              href={`/${language}/notifications`}
              className="flex items-center gap-2"
            >
              <Bell width={12} height={12} />
              Notifications
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                2
              </div>
            </Link>
          </NavigationMenuItem>
        )} */}
			</NavigationMenuList>
		</NavigationMenu>
	);
};
