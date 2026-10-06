"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Heart, Music2, Pause, Pointer } from "lucide-react";
import { HtmlLangSync, LanguageSwitch } from "@/components/language-switch";
import { useCopy } from "@/lib/i18n";

const AUDIO_SRC = "/khamma.mp3";
const VOLUME = 0.4;

type InvitationRevealProps = {
  children: ReactNode;
};

export function InvitationReveal({ children }: InvitationRevealProps) {
  const { t } = useCopy();
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
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
    contentRef.current?.querySelector("h1")?.focus();

    const onVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden) {
        audio.pause();
        setPlaying(false);
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
      <HtmlLangSync />
      {!opened ? (
        <div className="invite-gate fixed inset-0 z-[60] flex min-h-dvh flex-col overflow-y-auto">
          <span className="invite-gate-glow" aria-hidden />
          {/* Everything above the language choice is one big target that opens the invitation. */}
          <button
            type="button"
            onClick={() => void openInvitation()}
            aria-label={t.gateOpen}
            aria-describedby="gate-description"
            className="relative z-10 flex w-full flex-1 cursor-pointer flex-col items-center justify-center gap-6 px-5 pb-8 pt-12 text-center focus-visible:outline-offset-[-8px]"
          >
            <span className="gate-tap-icon" aria-hidden>
              <span className="gate-tap-ring" />
              <Pointer className="gate-tap-hand size-14" strokeWidth={1.6} />
            </span>
            <span className="block font-display text-4xl leading-snug tracking-tight text-foreground sm:text-5xl">
              {t.gateHeading}
            </span>
            <span id="gate-description" className="section-copy block max-w-xs text-lg">
              {t.gateSub}
            </span>
          </button>
          <div className="relative z-10 flex justify-center border-t border-border/70 px-5 pb-10 pt-6">
            <LanguageSwitch />
          </div>
        </div>
      ) : null}

      <div
        ref={contentRef}
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
          aria-label={playing ? t.musicPause : t.musicPlay}
          title={playing ? t.musicPause : t.musicPlay}
          className="music-toggle group fixed bottom-4 right-4 z-50 flex size-11 items-center justify-center rounded-full border border-border bg-white/90 text-primary shadow-[0_10px_28px_-12px_rgba(47,61,52,0.45)] backdrop-blur-md transition hover:bg-white/90 hover:text-[var(--leaf-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)]/50 sm:bottom-5 sm:right-5 sm:size-12"
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
