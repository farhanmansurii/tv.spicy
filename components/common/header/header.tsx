"use client";

import React from "react";
import { CatIcon, FilmIcon, SearchIcon, TvIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const categories = [
    {
        title: 'Search',
        icon: <SearchIcon />,
        href: '/'
    },
    {
        title: "Movies",
        href: "/movie",
        icon: <FilmIcon />
    },
    {
        title: "TV",
        href: "/tv",
        icon: <TvIcon />
    },
    {
        title: "Anime",
        href: "/anime",
        icon: <CatIcon />
    },
];

export const Header = () => {
    const pathname = usePathname();

    const isActiveRoute = (href:string) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(href);
    };
    return (
        <div className="mx-auto max-w-6xl px-4 lg:px-0">
            <div className="flex gap-4 my-3 mx-auto justify-center z-30">
                {categories.map((el) => (
                    <Link key={el.href} className="cursor-pointer z-40 relative" href={el.href}>
                        <motion.div
                            className={`flex items-center gap-2 h-12 border-b-2  px-1 pt-2 ${
                                isActiveRoute(el.href) ? 'text-primary' : ' border-transparent'
                            }`}

                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <div className="scale-95 ">{el.icon}</div>
                            <span className="hidden md:block">{el.title}</span>
                            {isActiveRoute(el.href) && (
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                    layoutId="underline"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
};
