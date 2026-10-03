"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Heart, Music2, Pause, Sparkles } from "lucide-react";

const AUDIO_SRC = "/khamma.mp3";
const VOLUME = 0.4;

type InvitationRevealProps = {
  children: ReactNode;
};

export function InvitationReveal({ children }: InvitationRevealProps) {
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wantPlayRef = useRef(true);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = VOLUME;
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!opened) return;

    const onVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden) {
        audio.pause();
      } else if (wantPlayRef.current) {
        void audio
          .play()
          .then(() => setPlaying(true))
          .catch(() => setPlaying(false));
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [opened]);

  async function openInvitation() {
    if (opened) return;
    setOpened(true);
    wantPlayRef.current = true;

    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      wantPlayRef.current = false;
      audio.pause();
      setPlaying(false);
      return;
    }

    wantPlayRef.current = true;
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      {!opened ? (
        <button
          type="button"
          onClick={() => void openInvitation()}
          className="invite-gate fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5 px-6 text-center"
          aria-label="Tap to open invitation"
        >
          <span className="invite-gate-glow" aria-hidden />
          <span className="relative flex flex-col items-center gap-4">
            <span className="invite-gate-icon flex size-16 items-center justify-center rounded-full border border-white/80 bg-white/70 text-[var(--blush-deep)] shadow-[0_18px_40px_-18px_rgba(47,61,52,0.45)] backdrop-blur-md sm:size-[4.5rem]">
              <Sparkles className="size-7 sm:size-8" strokeWidth={1.75} />
            </span>
            <span className="font-display text-4xl leading-none tracking-tight text-[var(--ink)] sm:text-5xl">
              Tap to open
            </span>
            <span className="max-w-[16rem] text-sm leading-relaxed text-[var(--ink-muted)] sm:text-[0.95rem]">
              A little surprise is waiting for you ♡
            </span>
          </span>
        </button>
      ) : null}

      <div
        className={`invite-content flex flex-1 flex-col ${opened ? "is-open" : "is-sealed"}`}
        aria-hidden={!opened}
        {...(!opened ? { inert: true } : {})}
      >
        {children}
      </div>

      {opened ? (
        <button
          type="button"
          onClick={() => void toggleMusic()}
          aria-pressed={playing}
          aria-label={playing ? "Pause music" : "Play music"}
          title={playing ? "Pause music" : "Play music"}
          className="music-toggle group fixed bottom-4 right-4 z-50 flex size-11 items-center justify-center rounded-full border border-white/80 bg-white/75 text-[var(--blush-deep)] shadow-[0_10px_28px_-12px_rgba(47,61,52,0.45)] backdrop-blur-md transition hover:bg-white/90 hover:text-[var(--leaf-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)]/50 sm:bottom-5 sm:right-5 sm:size-12"
        >
          {playing ? (
            <span className="relative flex items-center justify-center">
              <Pause className="size-[1.05rem] sm:size-5" strokeWidth={2.25} />
              <Heart
                className="absolute -right-1.5 -top-1.5 size-2.5 fill-[var(--blush)] text-[var(--blush-deep)] opacity-80"
                strokeWidth={2}
              />
            </span>
          ) : (
            <span className="relative flex items-center justify-center">
              <Music2 className="size-[1.05rem] sm:size-5" strokeWidth={2.25} />
              <Heart
                className="absolute -right-1.5 -top-1.5 size-2.5 fill-[var(--blush)] text-[var(--blush-deep)] opacity-70 transition group-hover:opacity-100"
                strokeWidth={2}
              />
            </span>
          )}
        </button>
      ) : null}
    </div>
  );
}
