"use client";

import { useEffect, useRef, useState } from "react";
import AdmitOneTicket, { TICKET_LAYOUT } from "@/components/ui/admit-one-ticket";

const paper = {
  engine: "generative" as const,
  colorBack: "#4f7356",
  colorFront: "#f6ecea",
  colorHighlight: "#e8c4c0",
  shape: "ripple" as const,
  type: "4x4" as const,
  size: 2.6,
  colorSteps: 4,
  originalColors: false,
  scale: 1.15,
  rotation: 8,
  offsetX: 0,
  offsetY: 0,
  speed: 0.22,
};

type ShowerTicketProps = {
  name?: string;
  presenter?: string;
  eventTitle?: string;
  stubText?: string;
  watermark?: string;
};

export function ShowerTicket({
  name = "Nidhi & Hardik",
  presenter = "Parents-to-be",
  eventTitle = "Baby Shower",
  stubText = "Admit one",
  watermark = "2026",
}: ShowerTicketProps) {
  const frame = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);

  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    const measure = () => setWidth(Math.max(260, Math.floor(node.clientWidth)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frame} className="mx-auto w-full max-w-[680px]">
      <div className="flex justify-center" style={{ filter: "drop-shadow(0 22px 28px rgba(47, 61, 52, 0.16))" }}>
        <AdmitOneTicket
          name={name}
          presenter={presenter}
          event={eventTitle}
          venue="124 Crain Road"
          dates="Oct 25 · 10:30 AM"
          stubText={stubText}
          watermark={watermark}
          width={width}
          texture={paper}
          layout={{ ...TICKET_LAYOUT, inkColor: "#243128", watermarkColor: "#f7f3ef", watermarkOpacity: 0.55 }}
        />
      </div>
    </div>
  );
}
