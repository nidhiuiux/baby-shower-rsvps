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

function Star({ className, tone = "sage" }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 4l3.6 9.2 9.9 1-7.4 6.8 2.3 9.7L20 25.4l-8.4 5.3 2.3-9.7-7.4-6.8 9.9-1L20 4z"
        fill={fill[tone]}
        opacity="0.55"
        stroke={stroke[tone]}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Moon({ className, tone = "blush" }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M30 6c-12 2-20 12-20 24s10 22 22 22c4 0 8-1 11-3-8 2-17-2-22-10C16 29 18 16 30 6z"
        fill={fill[tone]}
        opacity="0.45"
        stroke={stroke[tone]}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="28" cy="22" r="1.4" fill={stroke[tone]} opacity="0.45" />
      <circle cx="22" cy="32" r="1" fill={stroke[tone]} opacity="0.35" />
      <circle cx="30" cy="36" r="0.9" fill={stroke[tone]} opacity="0.3" />
    </svg>
  );
}

function Teddy({ className, tone = "blush" }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="18" r="7" fill={fill[tone]} opacity="0.4" stroke={stroke[tone]} strokeWidth="1.8" />
      <circle cx="48" cy="18" r="7" fill={fill[tone]} opacity="0.4" stroke={stroke[tone]} strokeWidth="1.8" />
      <circle cx="32" cy="26" r="14" fill={fill[tone]} opacity="0.4" stroke={stroke[tone]} strokeWidth="2" />
      <ellipse cx="32" cy="52" rx="16" ry="14" fill={fill.sage} opacity="0.3" stroke={stroke.sage} strokeWidth="2" />
      <circle cx="26" cy="24" r="1.5" fill={stroke[tone]} />
      <circle cx="38" cy="24" r="1.5" fill={stroke[tone]} />
      <ellipse cx="32" cy="29" rx="2.5" ry="2" fill={stroke[tone]} opacity="0.7" />
      <path d="M29 33c1.5 1.5 4.5 1.5 6 0" stroke={stroke[tone]} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="18" cy="48" r="5" stroke={stroke.sage} strokeWidth="1.7" opacity="0.75" />
      <circle cx="46" cy="48" r="5" stroke={stroke.sage} strokeWidth="1.7" opacity="0.75" />
      <circle cx="24" cy="62" r="4.5" stroke={stroke.sage} strokeWidth="1.7" opacity="0.75" />
      <circle cx="40" cy="62" r="4.5" stroke={stroke.sage} strokeWidth="1.7" opacity="0.75" />
    </svg>
  );
}

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

/** Primary doodle cluster shown above the parents' names */
export function BabyDoodles() {
  return (
    <div className="doodle-row" aria-hidden>
      <Star className="doodle doodle-sm doodle-delay-1" tone="sage" />
      <Teddy className="doodle doodle-md doodle-delay-2" tone="blush" />
      <Moon className="doodle doodle-lg doodle-delay-0" tone="blush" />
      <Teddy className="doodle doodle-md doodle-delay-3" tone="sage" />
      <Star className="doodle doodle-sm doodle-delay-4" tone="blush" />
    </div>
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
