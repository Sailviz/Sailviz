"use client";
import React, { useState } from "react";
import { ChevronDownIcon } from "components/icons/chevron-down-icon";
import { Accordion, AccordionItem } from "@nextui-org/react";
import clsx from "clsx";
import NextLink from "next/link";

interface Props {
  icon: React.ReactNode;
  title: string;
  items: string[];
  hrefs: string[];
  isActive: boolean
}

export const CollapseItems = ({ icon, items, title, hrefs, isActive }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex gap-4 h-full items-center cursor-pointer">
      <Accordion className="px-0">
        <AccordionItem
          indicator={<ChevronDownIcon />}
          classNames={{
            indicator: "data-[open=true]:-rotate-180",
            trigger:
              "py-0 min-h-[44px] hover:bg-default-100 rounded-xl active:scale-[0.98] transition-transform px-3.5",

            title:
              clsx(
                isActive
                  ? "bg-primary-100 [&_svg_path]:fill-primary-500"
                  : "hover:bg-default-100",
                "flex gap-2 w-full min-h-[44px] h-full items-center px-3.5 rounded-xl cursor-pointer transition-all duration-150 active:scale-[0.98]"
              ),
          }}
          aria-label="Accordion 1"
          title={
            <div className="flex flex-row gap-2">
              <span>{icon}</span>
              <span>{title}</span>
            </div>
          }
        >
          <div className="pl-12">
            {items.map((item, index) => (
              <NextLink
                href={hrefs[index]!}

                key={index}
                className="active:bg-none max-w-full w-full flex  text-default-500 hover:text-default-900 transition-colors"
              >
                {item}
              </NextLink>
            ))}
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
};