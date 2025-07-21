import { ReactNode } from "react";

interface OverlayProps {
    children: ReactNode;
    className?: string;
}

export default function Overlay({children, className}: OverlayProps) {
    return (
        <div className={`absolute bottom-16 bg-white p-4 shadow-lg z-20 transition-transform duration-300 transform translate-y-0 ${className}`}>
            {children}
        </div>
    )
}