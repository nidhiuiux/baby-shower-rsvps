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

function Mobile({ className, tone = "sage" }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 80 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 16c8-4 44-4 52 0"
        stroke={stroke[tone]}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M26 16v14" stroke={stroke[tone]} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M40 16v10" stroke={stroke[tone]} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M54 16v14" stroke={stroke[tone]} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="26" cy="36" r="5.5" fill={fill[tone]} opacity="0.55" />
      <circle cx="26" cy="36" r="5.5" stroke={stroke[tone]} strokeWidth="1.8" />
      <path
        d="M40 30l2.4 5.2 5.6.5-4.3 3.8 1.3 5.5L40 42.2l-4.9 2.8 1.3-5.5-4.3-3.8 5.6-.5L40 30z"
        fill={fill.blush}
        opacity="0.65"
        stroke={stroke.blush}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="54" cy="36" r="5.5" fill={fill.sage} opacity="0.45" />
      <circle cx="54" cy="36" r="5.5" stroke={stroke[tone]} strokeWidth="1.8" />
      <circle cx="20" cy="22" r="1.2" fill={stroke[tone]} opacity="0.35" />
      <circle cx="60" cy="24" r="1" fill={stroke.blush} opacity="0.4" />
    </svg>
  );
}

function Bottle({ className, tone = "sage" }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 48 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 8c0-2 2.5-4 4-4s4 2 4 4v6h-8V8z"
        fill={fill.blush}
        opacity="0.5"
        stroke={stroke.blush}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M16 14h16" stroke={stroke[tone]} strokeWidth="2" strokeLinecap="round" />
      <path
        d="M17 14h14v38c0 6-3.5 10-7 10s-7-4-7-10V14z"
        fill={fill[tone]}
        opacity="0.35"
        stroke={stroke[tone]}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M21 28h5M21 34h5M21 40h5M21 46h4" stroke={stroke[tone]} strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

function StackingRings({ className, tone = "blush" }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 72 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="36" cy="50" rx="26" ry="8" fill={fill.sage} opacity="0.4" stroke={stroke.sage} strokeWidth="2" />
      <ellipse cx="36" cy="38" rx="20" ry="7" fill={fill.blush} opacity="0.45" stroke={stroke.blush} strokeWidth="2" />
      <ellipse cx="36" cy="26" rx="14" ry="6" fill={fill.sage} opacity="0.35" stroke={stroke.sage} strokeWidth="2" />
      <ellipse cx="36" cy="16" rx="8" ry="5" fill={fill.blush} opacity="0.4" stroke={stroke.blush} strokeWidth="1.8" />
      <circle cx="54" cy="20" r="1.1" fill={stroke[tone]} opacity="0.35" />
    </svg>
  );
}

function Duck({ className, tone = "blush" }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 72 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 36c2-14 14-22 28-18 6 2 10 8 10 14 0 10-10 16-24 16-10 0-16-5-14-12z"
        fill={fill[tone]}
        opacity="0.4"
        stroke={stroke[tone]}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="22" r="10" fill={fill[tone]} opacity="0.35" stroke={stroke[tone]} strokeWidth="2" />
      <path
        d="M56 22c4 0 8 1 10 3-2 2-6 3-10 2"
        fill={fill.sage}
        opacity="0.5"
        stroke={stroke.sage}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="20" r="1.6" fill={stroke[tone]} />
      <path d="M14 40c-3 1-5 4-4 7" stroke={stroke[tone]} strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

function Swaddle({ className, tone = "sage" }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 56 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="28" cy="42" rx="18" ry="24" fill={fill[tone]} opacity="0.35" stroke={stroke[tone]} strokeWidth="2" />
      <circle cx="28" cy="20" r="11" fill={fill.blush} opacity="0.35" stroke={stroke.blush} strokeWidth="2" />
      <circle cx="24" cy="19" r="1.4" fill={stroke.blush} />
      <circle cx="32" cy="19" r="1.4" fill={stroke.blush} />
      <path d="M25 24c1.5 1.8 4.5 1.8 6 0" stroke={stroke.blush} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 38c8 4 16 4 24 0" stroke={stroke[tone]} strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
      <path d="M18 48c6 3 14 3 20 0" stroke={stroke[tone]} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <circle cx="40" cy="12" r="1.1" fill={stroke.blush} opacity="0.4" />
    </svg>
  );
}

function Crib({ className, tone = "sage" }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 12v32M68 12v32" stroke={stroke[tone]} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M12 14h56M12 42h56" stroke={stroke[tone]} strokeWidth="2" strokeLinecap="round" />
      <path d="M24 16v24M36 16v24M48 16v24M60 16v24" stroke={stroke[tone]} strokeWidth="1.7" strokeLinecap="round" opacity="0.7" />
      <ellipse cx="40" cy="28" rx="8" ry="5" fill={fill.blush} opacity="0.45" />
      <circle cx="37" cy="27" r="1" fill={stroke.blush} opacity="0.7" />
      <circle cx="43" cy="27" r="1" fill={stroke.blush} opacity="0.7" />
      <path d="M38 30c1 1 3 1 4 0" stroke={stroke.blush} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function Pacifier({ className, tone = "blush" }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 56 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="28" cy="18" rx="8" ry="10" fill={fill[tone]} opacity="0.45" stroke={stroke[tone]} strokeWidth="2" />
      <path
        d="M10 34c0-8 8-14 18-14s18 6 18 14c0 4-3 7-8 9H18c-5-2-8-5-8-9z"
        fill={fill.sage}
        opacity="0.35"
        stroke={stroke.sage}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="28" cy="54" r="10" stroke={stroke[tone]} strokeWidth="2" />
      <path d="M28 43v1" stroke={stroke[tone]} strokeWidth="2" strokeLinecap="round" />
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

function Stroller({ className, tone = "sage" }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 18c-2 0-4 2-4 6v10c0 8 8 14 22 14s22-6 22-14V28c0-6-4-10-10-10H18z"
        fill={fill.blush}
        opacity="0.35"
        stroke={stroke[tone]}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M14 22c-4-2-6-6-4-10" stroke={stroke[tone]} strokeWidth="1.8" strokeLinecap="round" opacity="0.65" />
      <path d="M58 28l14-12" stroke={stroke[tone]} strokeWidth="2" strokeLinecap="round" />
      <circle cx="28" cy="52" r="6" stroke={stroke[tone]} strokeWidth="2" />
      <circle cx="50" cy="52" r="6" stroke={stroke[tone]} strokeWidth="2" />
      <circle cx="28" cy="52" r="2" fill={stroke.blush} opacity="0.5" />
      <circle cx="50" cy="52" r="2" fill={stroke.blush} opacity="0.5" />
    </svg>
  );
}

function Onesie({ className, tone = "sage" }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22 12c2-4 6-6 10-6s8 2 10 6l8 4 4 10-8 2v28c0 4-3 8-7 8h-4c-2 0-3-1-4-3-1 2-2 3-4 3h-4c-4 0-7-4-7-8V28l-8-2 4-10 8-4z"
        fill={fill[tone]}
        opacity="0.35"
        stroke={stroke[tone]}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M32 28l1.8 3.8 4.2.4-3.2 2.9 1 4.1L32 37.2l-3.8 2 1-4.1-3.2-2.9 4.2-.4L32 28z"
        fill={fill.blush}
        opacity="0.7"
        stroke={stroke.blush}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Bib({ className, tone = "blush" }: DoodleProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 18c0-8 7-14 16-14s16 6 16 14c2 1 6 4 8 10 2 8-2 18-10 24-6 4-14 4-20 0-8-6-12-16-10-24 2-6 6-9 8-10z"
        fill={fill[tone]}
        opacity="0.35"
        stroke={stroke[tone]}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M14 28c2 1 3-1 4 0s2 2 4 1 3-2 4-1 2 2 4 1 3-2 4-1 2 2 4 1 3-2 4 0"
        stroke={stroke[tone]}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M32 36c-3-3-8 0-6 4 1 2 4 4 6 6 2-2 5-4 6-6 2-4-3-7-6-4z"
        fill={stroke.blush}
        opacity="0.45"
      />
    </svg>
  );
}

function TinyHeart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 16C10 16 2 11 2 6.5 2 4 4 2 6.5 2 8.2 2 9.4 2.9 10 4.1 10.6 2.9 11.8 2 13.5 2 16 2 18 4 18 6.5 18 11 10 16 10 16z"
        fill="var(--blush)"
        opacity="0.7"
        stroke="var(--blush-deep)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TinyStar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 2.5l1.9 4.4 4.8.5-3.6 3.3.1 4.8L10 13.2 6.8 15.5l.1-4.8-3.6-3.3 4.8-.5L10 2.5z"
        fill="var(--leaf-soft)"
        opacity="0.8"
        stroke="var(--leaf-deep)"
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
      <Mobile className="doodle doodle-sm doodle-delay-1" tone="sage" />
      <Bottle className="doodle doodle-xs doodle-delay-2" tone="sage" />
      <Duck className="doodle doodle-md doodle-delay-3" tone="blush" />
      <Swaddle className="doodle doodle-lg doodle-delay-0" tone="sage" />
      <Teddy className="doodle doodle-md doodle-delay-4" tone="blush" />
      <Pacifier className="doodle doodle-xs doodle-delay-5 hide-mobile-xs" tone="blush" />
      <Onesie className="doodle doodle-sm doodle-delay-2 hide-mobile" tone="sage" />
    </div>
  );
}

/** Soft floating accents around the RSVP page */
export function FloatingDoodles() {
  return (
    <div className="floating-doodles" aria-hidden>
      <StackingRings className="float-doodle float-a" />
      <Stroller className="float-doodle float-b" />
      <Crib className="float-doodle float-c" />
      <Bib className="float-doodle float-d" />
      <TinyHeart className="float-doodle float-heart-1" />
      <TinyStar className="float-doodle float-star-1" />
      <TinyHeart className="float-doodle float-heart-2" />
      <TinyStar className="float-doodle float-star-2" />
      <TinyHeart className="float-doodle float-heart-3" />
    </div>
  );
}
