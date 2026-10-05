import Image, { type StaticImageData } from "next/image";
import kabir from "../../public/art/kabir.webp";
import krishnaFlute from "../../public/art/krishna-flute.webp";
import krishnaMoon from "../../public/art/krishna-moon.webp";
import mother from "../../public/art/mother.webp";
import radha from "../../public/art/radha.webp";

type ArtProps = {
  className?: string;
  sizes: string;
  alt?: string;
  priority?: boolean;
};

function Art({ src, className, sizes, alt = "", priority }: ArtProps & { src: StaticImageData }) {
  return (
    <Image
      src={src}
      alt={alt}
      sizes={sizes}
      priority={priority}
      placeholder="empty"
      className={className}
    />
  );
}

export const KrishnaOnMoon = (props: ArtProps) => <Art src={krishnaMoon} {...props} />;
export const KrishnaWithFlute = (props: ArtProps) => <Art src={krishnaFlute} {...props} />;
export const KabirSaheb = (props: ArtProps) => <Art src={kabir} {...props} />;
export const MotherToBe = (props: ArtProps) => <Art src={mother} {...props} />;
export const BabyRadha = (props: ArtProps) => <Art src={radha} {...props} />;

/** Small lotus line-mark used as a divider between devotional sections */
export function LotusDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`lotus-divider ${className}`} aria-hidden>
      <span />
      <svg viewBox="0 0 64 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 4c5 6 7 12 0 24-7-12-5-18 0-24z" fill="var(--blush)" fillOpacity="0.55" stroke="var(--blush-deep)" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M31 28C22 26 15 20 13 11c8 1 15 6 18 17z" fill="var(--leaf-soft)" stroke="var(--leaf-deep)" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M33 28c9-2 16-8 18-17-8 1-15 6-18 17z" fill="var(--leaf-soft)" stroke="var(--leaf-deep)" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M30 30c-8 1-16-2-22-8 8-2 17 0 22 8zM34 30c8 1 16-2 22-8-8-2-17 0-22 8z" fill="var(--blush)" fillOpacity="0.4" stroke="var(--blush-deep)" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
      <span />
    </div>
  );
}
