"use client"

import { useEffect, useRef, useState } from "react";

const Tooltip = ({
    children, content
}: Readonly<{
    children: React.ReactNode;
    content: string;
}>) => {
    const [top, setTop] = useState("bottom-2");
    const tooltipRef = useRef(null);
  
    useEffect(() => {
        const checkPosition = () => {
            if (!tooltipRef.current) {
                return;
            }
            const rect = (tooltipRef.current as HTMLDivElement).getBoundingClientRect();
            const top = rect?.top < 20 ? "top-10": "bottom-2";
            setTop(top);
        };

        window.addEventListener('scroll', checkPosition);
        window.addEventListener('resize', checkPosition);
        checkPosition();

        return () => {
            window.removeEventListener('scroll', checkPosition);
            window.removeEventListener('resize', checkPosition);
        };
    }, []);
    return (
        <div className="relative flex flex-col items-center group" ref={tooltipRef}>
            {children}
            <div className={`absolute z-50 ${top} flex-col items-center hidden mb-6 group-hover:flex`}>
                <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-black shadow-lg rounded-md">{content}</span>
            </div>
        </div>
    );
};

export default Tooltip;