import Link from 'next/link';
import { useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import * as React from 'react';

export type IMenu = {
	id: number;
	title: string;
	url: string;
	dropdown?: boolean;
	items?: IMenu[];
};

type MenuProps = {
	list: IMenu[];
};

const Menu = ({ list }: MenuProps) => {
	const [hovered, setHovered] = useState<number | null>(null);

	return (
		<MotionConfig transition={{ bounce: 0, type: 'tween' }}>
			<nav className={'relative'}>
				<ul className={'flex items-center'}>
					{list?.map((item) => {
						return (
							<li key={item.id} className={'relative'}>
								<Link
									className={`
                    relative flex items-center justify-center rounded px-8 py-3 transition-all
                    hover:bg-foreground/10
                    ${hovered === item?.id ? 'bg-foreground/10' : ''}
                  `}
									onMouseEnter={() => setHovered(item.id)}
									onMouseLeave={() => setHovered(null)}
									href={item?.url}
								>
									{item?.title}
								</Link>
								{hovered === item?.id && !item?.dropdown && (
									<motion.div
										layout
										layoutId={`cursor`}
										className={'absolute h-0.5 w-full bg-foreground'}
									/>
								)}
								{item?.dropdown && hovered === item?.id && (
									<div
										className="absolute left-0 top-full"
										onMouseEnter={() => setHovered(item.id)}
										onMouseLeave={() => setHovered(null)}
									>
										<motion.div
											layout
											transition={{ bounce: 0 }}
											initial={{ y: 10 }}
											animate={{ y: 0 }}
											exit={{ y: 10 }}
											style={{
												borderRadius: '8px',
											}}
											className="mt-4 flex w-64 flex-col rounded bg-background border"
											layoutId={'cursor'}
										>
											{item?.items?.map((nav) => {
												return (
													<motion.a
														key={`link-${nav?.id}`}
														href={`${nav?.url}`}
														className={'w-full p-4 hover:bg-muted'}
													>
														{nav?.title}
													</motion.a>
												);
											})}
										</motion.div>
									</div>
								)}
							</li>
						);
					})}
				</ul>
			</nav>
		</MotionConfig>
	);
};

export default Menu;
