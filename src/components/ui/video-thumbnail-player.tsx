"use client";

import * as React from "react";
import Image, { type StaticImageData } from "next/image";
import { createPortal } from "react-dom";
import { Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  thumbnailUrl: string | StaticImageData;
  /** Embed URL. Loaded only once the player opens, so the page stays light. */
  videoUrl: string;
  title: string;
  description?: string;
  /** Hide the title/description overlay when the thumbnail already carries its own text. */
  hideCaption?: boolean;
  closeLabel?: string;
  aspectRatio?: "16/9" | "4/3" | "1/1";
}

/**
 * A thumbnail with a play button that opens the video in a full-screen player.
 * Adapted from the supplied component: a real <button>, focus handling, backdrop
 * click to close, and the invitation's colours.
 */
const VideoPlayer = React.forwardRef<HTMLButtonElement, VideoPlayerProps>(
  ({ className, thumbnailUrl, videoUrl, title, description, hideCaption = false, closeLabel = "Close video", aspectRatio = "16/9", ...props }, ref) => {
    const [open, setOpen] = React.useState(false);
    const closeRef = React.useRef<HTMLButtonElement>(null);
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);

    React.useEffect(() => {
      if (!open) return;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      closeRef.current?.focus();
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      window.addEventListener("keydown", onKey);
      const trigger = triggerRef.current;
      return () => {
        document.body.style.overflow = previousOverflow;
        window.removeEventListener("keydown", onKey);
        trigger?.focus();
      };
    }, [open]);

    return (
      <>
        <button
          ref={(node) => {
            triggerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Play video: ${title}`}
          className={cn(
            "video-thumb group relative block w-full cursor-pointer overflow-hidden rounded-2xl border border-white/80 shadow-[0_18px_40px_-24px_rgba(47,61,52,0.6)]",
            className,
          )}
          style={{ aspectRatio }}
          {...props}
        >
          <Image
            src={thumbnailUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 640px, 92vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[rgba(47,61,52,0.45)] via-transparent to-transparent" />
          <span aria-hidden className="absolute inset-0 flex items-center justify-center">
            <span className="video-thumb-play relative flex size-16 items-center justify-center rounded-full bg-white/90 text-[var(--leaf-deep)] shadow-lg transition-transform duration-300 group-hover:scale-110 sm:size-20">
              <Play className="ml-1 size-7 fill-current sm:size-8" />
            </span>
          </span>
          {!hideCaption && (
            <span className="absolute bottom-0 left-0 p-5 text-left">
              <span className="block font-display text-2xl text-white">{title}</span>
              {description && <span className="mt-1 block text-sm text-white/85">{description}</span>}
            </span>
          )}
        </button>

        {open &&
          createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(24,32,27,0.86)] p-4 backdrop-blur-sm animate-in fade-in-0"
              onClick={() => setOpen(false)}
            >
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label={closeLabel}
                className="absolute right-4 top-4 z-10 flex size-12 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
              >
                <X className="size-6" />
              </button>
              <div className="aspect-video w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
                <iframe
                  src={videoUrl}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="size-full rounded-xl border-0 bg-black"
                />
              </div>
            </div>,
            document.body,
          )}
      </>
    );
  },
);
VideoPlayer.displayName = "VideoPlayer";

export { VideoPlayer };
