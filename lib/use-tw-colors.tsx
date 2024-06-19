"use client";
const tailwindColors = [
  "black",
  "white",
  "gray-50",
  "gray-100",
  "gray-200",
  "gray-300",
  "gray-400",
  "gray-500",
  "gray-600",
  "gray-700",
  "gray-800",
  "gray-900",
  "red-50",
  "red-100",
  "red-200",
  "red-300",
  "red-400",
  "red-500",
  "red-600",
  "red-700",
  "red-800",
  "red-900",
  "yellow-50",
  "yellow-100",
  "yellow-200",
  "yellow-300",
  "yellow-400",
  "yellow-500",
  "yellow-600",
  "yellow-700",
  "yellow-800",
  "yellow-900",
  "green-50",
  "green-100",
  "green-200",
  "green-300",
  "green-400",
  "green-500",
  "green-600",
  "green-700",
  "green-800",
  "green-900",
  "blue-50",
  "blue-100",
  "blue-200",
  "blue-300",
  "blue-400",
  "blue-500",
  "blue-600",
  "blue-700",
  "blue-800",
  "blue-900",
  "indigo-50",
  "indigo-100",
  "indigo-200",
  "indigo-300",
  "indigo-400",
  "indigo-500",
  "indigo-600",
  "indigo-700",
  "indigo-800",
  "indigo-900",
  "purple-50",
  "purple-100",
  "purple-200",
  "purple-300",
  "purple-400",
  "purple-500",
  "purple-600",
  "purple-700",
  "purple-800",
  "purple-900",
  "pink-50",
  "pink-100",
  "pink-200",
  "pink-300",
  "pink-400",
  "pink-500",
  "pink-600",
  "pink-700",
  "pink-800",
  "pink-900",
];

import { useState } from "react";

const useRandomColor = () => {
  const [backgroundColor, setBackgroundColor] = useState("");
  const [textColor, setTextColor] = useState("");

  const getRandomColor = () => {
    const color =
      tailwindColors[Math.floor(Math.random() * tailwindColors.length)];
    return color;
  };

  const updateColors = () => {
    const colorClass = getRandomColor();
    setBackgroundColor(colorClass);
    setTextColor(getContrastingTextColor(colorClass));
  };

  const getContrastingTextColor = (colorClass) => {
    const color = colorClass.split("-")[0];
    const shade = colorClass.split("-")[1];

    if (shade === "50") return `${color}-800`;
    if (shade === "100") return `${color}-800`;
    if (shade === "200") return `${color}-800`;
    if (shade === "300") return `${color}-800`;
    if (shade === "400") return `${color}-800`;
    if (shade === "500") return `${color}-800`;
    if (shade === "600") return `${color}-800`;
    if (shade === "700") return `${color}-200`;
    if (shade === "800") return `${color}-200`;
    if (shade === "900") return "text-white";

    return "text-white";
  };

  return { backgroundColor, textColor, updateColors };
};

export default useRandomColor;
