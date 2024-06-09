"use client";
import { useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Fingerprint,
  Info,
  CircleDollarSign,
  Newspaper,
  User,
  Home,
  Search,
  Sun,
  MenuSquare,
} from "lucide-react";

const tabs = [
  { title: "Home", icon: <Home /> },
  { title: "Search", icon: <Search /> },
  { title: "Theme", icon: <Sun /> },
  { title: "Explore", icon: <MenuSquare /> },
  { title: "Profile", icon: <User /> },
];

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".5rem",
    paddingRight: ".5rem",
  },
  animate: (selected: boolean) => ({
    gap: selected ? ".5rem" : 0,
    paddingLeft: selected ? "1rem" : ".5rem",
    paddingRight: selected ? "1rem" : ".5rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.1, type: "spring", bounce: 0, duration: 0.35 };

interface TabProps {
  text: string;
  selected: boolean;
  setSelected: (tab: Object) => void;
  children: ReactNode;
  index: number;
}

const Tab = ({ text, selected, setSelected, index, children }: TabProps) => {
  return (
    <motion.button
      variants={buttonVariants}
      initial="initial"
      animate="animate"
      custom={selected}
      onClick={() => setSelected(tabs[index])}
      transition={transition}
      className={`${
        selected ? "bg-primary text-primary-foreground " : ""
      } relative flex items-center rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-300 focus-within:outline-red-500/50`}
    >
      {children}
      <AnimatePresence>
        {selected && (
          <motion.span
            variants={spanVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className="overflow-hidden"
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// IconTabs component
const IconTabs = ({ center }: { center?: boolean }) => {
  // State to manage selected tab
  const [selected, setSelected] = useState<Object>(tabs[0]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 ${
        center ? "justify-center" : ""
      } mb-8 r z-30 gap-2  justify-center items-center flex border-gray-200 pb-2 dark:border-gray-600`}
    >
      <div className="flex p-2 bg-background w-fit rounded-full flex-wrap items-center">
        {tabs.map((tab, index) => (
          <Tab
            text={tab.title}
            selected={selected === tab}
            setSelected={setSelected}
            index={index}
            key={tab.title}
          >
            {tab.icon}
          </Tab>
        ))}
      </div>
    </div>
  );
};

export default IconTabs;
