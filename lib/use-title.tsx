"use client";
import { useState, useEffect } from "react";
import titles from "./config.json";
import exp from "constants";
interface Props {
  placeholders: {
    [key: string]: {
      default: string[];
      unique: string[];
      subheading: string[];
    };
  };
}
const useTitle = () => {
  const [title, setTitle] = useState<string>("");
  const [timeOfDay, setTimeOfDay] = useState<string>("");

  useEffect(() => {
    const currentTime = new Date().getHours();
    if (currentTime >= 6 && currentTime < 12) {
      setTimeOfDay("morning");
    } else if (currentTime >= 12 && currentTime < 17) {
      setTimeOfDay("afternoon");
    } else if (currentTime >= 17 && currentTime < 22) {
      setTimeOfDay("evening");
    } else {
      setTimeOfDay("night");
    }
  }, []);

  useEffect(() => {
    if (titles[timeOfDay]) {
      const randomIndex = Math.floor(
        Math.random() * (titles[timeOfDay].default.length || 0)
      );
      setTitle(titles[timeOfDay].default[randomIndex] || "");
    }
  }, [timeOfDay]);

  return { title };
};
export default useTitle;
