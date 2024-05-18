"use client";
import { Show } from "@/lib/types";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import MoreInfoComponent from "../common/MoreInfoComponent";

const RelatedShowsComponent = dynamic(
  () => import("../container/RelatedShowContainer"),
  {
    ssr: false,
  }
);

const tabs = ["Info", "Related Shows", "Recommendations"];

interface TabProps {
  text: string;
  selected: boolean;
  setSelected: (text: string) => void;
}

export default function MoreDetailsContainer(props: {
  show: Show;
  type: string;
}) {
  const [selected, setSelected] = useState<string>(tabs[0]);

  const renderContent = () => {
    switch (selected) {
      case "Info":
        return <MoreInfoComponent type={props.type} show={props.show} />;
      case "Related Shows":
        return (
          <RelatedShowsComponent
            relation="similar"
            type={props.type}
            show={props.show}
          />
        );
      case "Recommendations":
        return (
          <RelatedShowsComponent
            relation="recommendations"
            type={props.type}
            show={props.show}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-[96%] mx-auto">
      <div className="mb-8 p-2 flex flex-wrap items-center gap-2">
        {tabs.map((tab, index) => (
          <Tab
            text={tab}
            selected={selected === tab}
            setSelected={setSelected}
            key={tab}
          />
        ))}
      </div>
      <div className="w-[96%] min-h-[200px] mx-auto">{renderContent()}</div>
    </div>
  );
}

const Tab = ({ text, selected, setSelected }: TabProps) => {
  return (
    <button
      onClick={() => setSelected(text)}
      className={`${
        selected
          ? "text-secondary"
          : "text-secondary-foreground hover:text-secondary-foreground/40"
      } relative rounded-full px-4 py-2 text-sm font-medium transition-colors`}
    >
      <span className="relative z-10">{text}</span>
      {selected && (
        <motion.span
          layoutId="tab"
          transition={{ type: "spring", duration: 0.4 }}
          className="absolute inset-0 z-0 rounded bg-primary"
        ></motion.span>
      )}
    </button>
  );
};
