"use client";

import { Dithering, type DitheringProps } from "@paper-design/shaders-react";
import { useId, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";

const SHAPES = ["simplex", "warp", "dots", "wave", "ripple", "swirl", "sphere"] as const;
const TYPES = ["random", "2x2", "4x4", "8x8"] as const;

export const TICKET_GEOMETRY = {
  width: 741,
  height: 425,
  stub: 0.218,
} as const;

export type TicketLayout = {
  inkColor: string;
  watermarkColor: string;
  watermarkOpacity: number;
};

export const TICKET_LAYOUT: TicketLayout = {
  inkColor: "#5a3520",
  watermarkColor: "#f7f3ef",
  watermarkOpacity: 0.55,
};

export const TICKET_GRADIENT = {
  from: "#f6ecea",
  via: "#e8c4c0",
  to: "#4f7356",
} as const;

export const TICKET_STYLE = {
  radius: 22,
  shadow: "0 22px 28px rgba(47, 61, 52, 0.16)",
} as const;

export type TicketTexture = {
  engine?: "generative" | "image";
  colorBack?: string;
  colorFront?: string;
  colorHighlight?: string;
  shape?: string;
  type?: string;
  size?: number;
  colorSteps?: number;
  originalColors?: boolean;
  scale?: number;
  rotation?: number;
  offsetX?: number;
  offsetY?: number;
  speed?: number;
};

export const TICKET_TEXTURE: TicketTexture = {
  engine: "generative",
  colorBack: "#4f7356",
  colorFront: "#f6ecea",
  colorHighlight: "#e8c4c0",
  shape: "ripple",
  type: "4x4",
  size: 2.6,
  colorSteps: 4,
  originalColors: false,
  scale: 1.15,
  rotation: 8,
  offsetX: 0,
  offsetY: 0,
  speed: 0.22,
};

const SPLIT = 1 - TICKET_GEOMETRY.stub;
const CRX = 0.028;
const CRY = 0.049;
const NX = 0.0155;
const NY = 0.027;

const TICKET_CLIP = `M ${CRX} 0 H ${SPLIT - NX} A ${NX} ${NY} 0 0 1 ${SPLIT + NX} 0 H ${1 - CRX} A ${CRX} ${CRY} 0 0 1 1 ${CRY} V ${1 - CRY} A ${CRX} ${CRY} 0 0 1 ${1 - CRX} 1 H ${SPLIT + NX} A ${NX} ${NY} 0 0 1 ${SPLIT - NX} 1 H ${CRX} A ${CRX} ${CRY} 0 0 1 0 ${1 - CRY} V ${CRY} A ${CRX} ${CRY} 0 0 1 ${CRX} 0 Z`;

export function ticketClipPath() {
  return TICKET_CLIP;
}

export function remixTexture(patch: Partial<TicketTexture> = {}) {
  return { ...TICKET_TEXTURE, ...patch };
}

export function remixGradient(patch: Partial<typeof TICKET_GRADIENT> = {}) {
  return { ...TICKET_GRADIENT, ...patch };
}

export function remixTicketStyle(patch: Partial<typeof TICKET_STYLE> = {}) {
  return { ...TICKET_STYLE, ...patch };
}

/** Kept for the original component API. The shower already has its own song, so this stays silent. */
export function playShutterSound() {}

function asShape(value: string | undefined): DitheringProps["shape"] {
  return SHAPES.find((shape) => shape === value) ?? "ripple";
}

function asType(value: string | undefined): DitheringProps["type"] {
  return TYPES.find((type) => type === value) ?? "4x4";
}

function nameLines(name: string) {
  const parts = name.trim().toUpperCase().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return ["GUEST"];
  if (parts.length <= 3) return parts;
  return [parts[0], parts[1], parts.slice(2).join(" ")];
}

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function subscribeNothing() {
  return () => {};
}

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function serverFalse() {
  return false;
}

type Glare = { x: number; y: number; on: boolean };

export function TiltCard({
  children,
  className,
  style,
  max = 8,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  max?: number;
}) {
  const [transform, setTransform] = useState(
    "perspective(980px) rotateX(0deg) rotateY(0deg)",
  );
  const [glare, setGlare] = useState<Glare>({ x: 62, y: 28, on: false });

  function onMove(event: React.PointerEvent<HTMLDivElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - py) * max;
    const rotateY = (px - 0.5) * max;
    setTransform(`perspective(980px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
    setGlare({ x: px * 100, y: py * 100, on: true });
  }

  function onLeave() {
    setTransform("perspective(980px) rotateX(0deg) rotateY(0deg)");
    setGlare((current) => ({ ...current, on: false }));
  }

  return (
    <div
      className={className}
      style={{
        ...style,
        transform,
        transition: "transform 180ms ease-out",
        transformStyle: "preserve-3d",
      }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      data-glare-x={glare.x}
      data-glare-y={glare.y}
      data-glare-on={glare.on ? "true" : "false"}
    >
      {children}
    </div>
  );
}

export type AdmitOneTicketProps = {
  name?: string;
  presenter?: string;
  event?: string;
  venue?: string;
  dates?: string;
  stubText?: string;
  watermark?: string;
  width?: number;
  texture?: TicketTexture;
  layout?: Partial<TicketLayout>;
  className?: string;
};

export function TicketCard({
  name = "Nidhi & Hardik",
  presenter = "Parents-to-be",
  event = "Baby Shower",
  venue = "124 Crain Road",
  dates = "Oct 25 · 10:30 AM",
  stubText = "Admit one",
  watermark = "2026",
  width = TICKET_GEOMETRY.width,
  texture = TICKET_TEXTURE,
  layout,
  className,
}: AdmitOneTicketProps) {
  const rawId = useId();
  const clipId = `ticket-${rawId.replace(/:/g, "")}`;
  const webgl = useSyncExternalStore(subscribeNothing, canUseWebGL, serverFalse);
  const reduced = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, serverFalse);
  const [glare, setGlare] = useState<Glare>({ x: 64, y: 30, on: false });

  const ink = layout?.inkColor ?? TICKET_LAYOUT.inkColor;
  const watermarkColor = layout?.watermarkColor ?? TICKET_LAYOUT.watermarkColor;
  const watermarkOpacity = layout?.watermarkOpacity ?? TICKET_LAYOUT.watermarkOpacity;
  const paper = { ...TICKET_TEXTURE, ...texture };
  const lines = nameLines(name);
  const typeSize = Math.max(12, Math.min(27, width / 27));
  const front = paper.colorFront ?? TICKET_TEXTURE.colorFront ?? "#f6ecea";
  const back = paper.colorBack ?? TICKET_TEXTURE.colorBack ?? "#4f7356";
  const highlight = paper.colorHighlight ?? TICKET_TEXTURE.colorHighlight ?? "#e8c4c0";

  function onMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setGlare({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
      on: true,
    });
  }

  return (
    <div
      className={className}
      style={{ width, maxWidth: "100%", fontSize: typeSize }}
      onPointerMove={onMove}
      onPointerLeave={() => setGlare((current) => ({ ...current, on: false }))}
    >
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={TICKET_CLIP} />
          </clipPath>
        </defs>
      </svg>

      <div
        role="img"
        aria-label={`${name}. ${event}. ${dates}. ${venue}. ${stubText}.`}
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: `${TICKET_GEOMETRY.width} / ${TICKET_GEOMETRY.height}`,
          clipPath: `url(#${clipId})`,
          background: `linear-gradient(115deg, ${front} 0%, ${highlight} 46%, ${back} 100%)`,
        }}
      >
        {webgl && (
          <Dithering
            className="absolute inset-0 h-full w-full"
            style={{ width: "100%", height: "100%" }}
            colorBack={back}
            colorFront={front}
            shape={asShape(paper.shape)}
            type={asType(paper.type)}
            size={paper.size ?? 2.6}
            speed={reduced ? 0 : (paper.speed ?? 0.22)}
            scale={paper.scale ?? 1.15}
            rotation={paper.rotation ?? 0}
            offsetX={paper.offsetX ?? 0}
            offsetY={paper.offsetY ?? 0}
            fit="cover"
            maxPixelCount={720000}
            minPixelRatio={1}
          />
        )}

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(90deg, ${front}d4 0%, ${front}8c 48%, transparent 74%)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: glare.on ? 1 : 0,
            background: `radial-gradient(38% 55% at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.38), transparent 70%)`,
          }}
        />

        <p
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-[8%] -translate-y-1/2 font-display leading-none tracking-tight select-none"
          style={{
            color: watermarkColor,
            opacity: watermarkOpacity,
            fontSize: "5.4em",
            transform: "translateY(-50%) rotate(-14deg)",
          }}
        >
          {watermark}
        </p>

        <div className="relative z-10 flex h-full">
          <div className="flex w-[78%] flex-col justify-between py-[8%] pr-[4%] pl-[6%] text-left">
            <p
              className="text-[0.68em] font-semibold tracking-[0.22em] uppercase"
              style={{ color: ink }}
            >
              {presenter}
            </p>
            <div>
              {lines.map((line) => (
                <p
                  key={line}
                  className="font-display leading-[0.88] tracking-tight"
                  style={{
                    color: ink,
                    fontSize: line.length > 12 ? "1.55em" : "2.05em",
                  }}
                >
                  {line}
                </p>
              ))}
              <p className="mt-[0.45em] text-[0.78em] tracking-[0.16em] uppercase" style={{ color: ink }}>
                {event}
              </p>
            </div>
            <div
              className="flex flex-wrap gap-x-[1.1em] gap-y-1 text-[0.62em] font-semibold tracking-[0.12em] uppercase"
              style={{ color: ink }}
            >
              <span>{venue}</span>
              <span>{dates}</span>
            </div>
          </div>

          <div className="flex w-[22%] items-center justify-center">
            <p
              className="text-[0.72em] font-semibold tracking-[0.28em] uppercase"
              style={{
                color: ink,
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
              }}
            >
              {stubText}
            </p>
          </div>
        </div>

        <div
          className="pointer-events-none absolute top-[9%] bottom-[9%] border-l border-dashed"
          style={{ left: `${SPLIT * 100}%`, borderColor: ink, opacity: 0.4 }}
        />
      </div>
    </div>
  );
}

export default function AdmitOneTicket(props: AdmitOneTicketProps) {
  return (
    <TiltCard className={props.className} style={{ width: props.width, maxWidth: "100%" }}>
      <TicketCard {...props} className={undefined} />
    </TiltCard>
  );
}
