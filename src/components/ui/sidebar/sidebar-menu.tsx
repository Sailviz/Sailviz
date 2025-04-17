import React from "react";

interface Props {
    title: string;
    children?: React.ReactNode;
    onClick?: () => void;
}

export const SidebarMenu = ({ title, children, onClick }: Props) => {
    return (
        <div className="flex gap-2 flex-col" onClick={onClick}>
            <span className="text-xs font-normal ">{title}</span>
            {children}
        </div>
    );
};