type DoodleProps = {
  className?: string;
  tone?: "sage" | "blush";
};

const stroke = {
  sage: "var(--leaf-deep)",
  blush: "var(--blush-deep)",
} as const;

const fill = {
  sage: "var(--leaf-soft)",
  blush: "var(--blush)",
} as const;

function TinyStar({ className, tone = "sage" }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 2.5l1.9 4.4 4.8.5-3.6 3.3.1 4.8L10 13.2 6.8 15.5l.1-4.8-3.6-3.3 4.8-.5L10 2.5z"
        fill={fill[tone]}
        opacity="0.7"
        stroke={stroke[tone]}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Soft floating accents — only a few faint stars */
export function FloatingDoodles() {
  return (
    <div className="floating-doodles" aria-hidden>
      <TinyStar className="float-doodle float-star-1" tone="sage" />
      <TinyStar className="float-doodle float-star-2" tone="blush" />
      <TinyStar className="float-doodle float-star-3" tone="sage" />
    </div>
  );
}
