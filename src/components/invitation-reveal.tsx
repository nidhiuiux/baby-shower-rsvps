"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Heart, Music2, Pause, Pointer } from "lucide-react";
import { HtmlLangSync, LanguageSwitch } from "@/components/language-switch";
import CounterLoading from "@/components/ui/counter-loader";
import { BgradientAnim } from "@/components/ui/soft-gradient-background-animation";
import { useCopy } from "@/lib/i18n";

const AUDIO_SRC = "/khamma.mp3";
const VOLUME = 0.4;
const OPEN_DELAY_MS = 5_000;

type InvitationRevealProps = {
  children: ReactNode;
};

export function InvitationReveal({ children }: InvitationRevealProps) {
  const { t } = useCopy();
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(5);
  const openedRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wantPlayRef = useRef(false);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = VOLUME;
    audio.preload = "none";
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

  const openInvitation = useCallback(async (withMusic: boolean) => {
    // A tap and the deadline can arrive together; reveal only once.
    if (openedRef.current) return;
    openedRef.current = true;
    wantPlayRef.current = withMusic;
    setOpened(true);

    // Timed opening is silent. Audio starts only from a guest's tap.
    const audio = audioRef.current;
    if (!withMusic || !audio) return;
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      wantPlayRef.current = false;
      setPlaying(false);
    }
  }, []);

  useEffect(() => {
    if (opened) return;
    const deadline = performance.now() + OPEN_DELAY_MS;
    const tick = window.setInterval(() => {
      setRemainingSeconds(Math.max(1, Math.ceil((deadline - performance.now()) / 1_000)));
    }, 100);
    const timer = window.setTimeout(() => void openInvitation(false), OPEN_DELAY_MS);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(timer);
    };
  }, [opened, openInvitation]);

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
      wantPlayRef.current = false;
      setPlaying(false);
    }
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <HtmlLangSync />
      {!opened ? (
        <div className="invite-gate fixed inset-0 z-[60] flex min-h-dvh flex-col overflow-y-auto">
          <BgradientAnim animationDuration={14} />
          {/* Everything above the language choice opens immediately when tapped. */}
          <button
            type="button"
            onClick={() => void openInvitation(true)}
            aria-label={t.gateOpen}
            aria-describedby="gate-description gate-timing"
            className="gate-open-target relative z-10 flex w-full flex-1 cursor-pointer flex-col items-center justify-center px-5 py-8 text-center focus-visible:outline-offset-[-8px] sm:py-10"
          >
            <span className="gate-opening-card flex w-full max-w-md flex-col items-center gap-5 rounded-[2rem] border border-white/80 px-6 py-8 sm:px-10 sm:py-10">
              <span className="eyebrow">{t.brand}</span>
              <span className="counter-medallion">
                <CounterLoading value={remainingSeconds} />
              </span>
              <span className="gate-opening-title block font-display text-4xl leading-snug tracking-tight text-foreground sm:text-5xl">
                {t.gateHeading}
              </span>
              <span id="gate-description" className="section-copy block max-w-xs">
                {t.gateSub}
              </span>
              <span className="gate-open-label inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
                <Pointer className="size-4" strokeWidth={1.75} aria-hidden="true" />
                {t.gateOpen}
              </span>
              <span aria-hidden="true" className="text-sm leading-relaxed text-muted-foreground">
                {t.gateCountdown(remainingSeconds)}
              </span>
              <span id="gate-timing" className="sr-only">{t.gateAutoOpen}</span>
            </span>
          </button>
          <div className="relative z-10 flex justify-center px-5 pb-8 pt-2 sm:pb-10">
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
