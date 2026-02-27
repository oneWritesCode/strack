"use client"
import { useEffect, useState } from "react";


interface LoaderProps {
  isLoading?: boolean;
}

export default function Loading() {
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
const handleLoad = () => {
    setTimeout(() => {
    setIsLoading(false);
    }, 300);
};

if (document.readyState === "complete") {
    handleLoad();
} else {
    window.addEventListener("load", handleLoad);
    return () => window.removeEventListener("load", handleLoad);
}
}, []);
  return (
    <Loader isLoading={isLoading}/>
  )
}


export const Loader = ({ isLoading }: LoaderProps) => {

  return (
    <div
      className={`
        fixed inset-0 bg-(--background-color) flex flex-col items-center justify-center z-9999
        transition-all duration-500 ease-out
        ${isLoading ? "opacity-100 visible" : "opacity-0 invisible"}
      `}
    >
       <span className="tracking-widest pb-10">
         <div className="w-12 h-12 border-5 border-yellow-900/10 border-t-(--red-background) rounded-full animate-spin" />
        </span>
    </div>
  );
};
