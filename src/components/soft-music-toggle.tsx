"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, Music2, Pause } from "lucide-react";

const STORAGE_KEY = "baby-shower-music-on";
const VOLUME = 0.35;
const AUDIO_SRC = "/lullaby-soft.mp3";

type SoftMusicToggleProps = {
  className?: string;
};

/** Gentle Twinkle Twinkle–style Web Audio loop if the MP3 fails to load. */
function createFallbackLullaby(ctx: AudioContext): { stop: () => void } {
  const master = ctx.createGain();
  master.gain.value = VOLUME * 0.85;
  master.connect(ctx.destination);

  // Public-domain Twinkle Twinkle motif (Hz)
  const phrase = [
    261.63, 261.63, 392.0, 392.0, 440.0, 440.0, 392.0, 0,
    349.23, 349.23, 329.63, 329.63, 293.66, 293.66, 261.63, 0,
  ];
  const beat = 0.55;
  let nextAt = ctx.currentTime + 0.05;
  let cancelled = false;
  let timer: number | undefined;

  const schedulePhrase = () => {
    if (cancelled) return;
    phrase.forEach((freq, i) => {
      const start = nextAt + i * beat;
      if (freq <= 0) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + beat * 0.9);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + beat);
    });
    nextAt += phrase.length * beat + 0.6;
    timer = window.setTimeout(schedulePhrase, (phrase.length * beat + 0.4) * 1000);
  };

  schedulePhrase();

  return {
    stop: () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
      try {
        master.disconnect();
      } catch {
        /* ignore */
      }
    },
  };
}

export function SoftMusicToggle({ className = "" }: SoftMusicToggleProps) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fallbackCtxRef = useRef<AudioContext | null>(null);
  const fallbackStopRef = useRef<(() => void) | null>(null);
  const useFallbackRef = useRef(false);
  const wantPlayRef = useRef(false);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = VOLUME;
    audio.preload = "auto";
    audioRef.current = audio;

    const onError = () => {
      useFallbackRef.current = true;
    };

    audio.addEventListener("error", onError);

    // Optional preference flag only — never force autoplay on load.
    try {
      wantPlayRef.current = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      /* ignore */
    }

    return () => {
      audio.pause();
      audio.removeEventListener("error", onError);
      audioRef.current = null;
      fallbackStopRef.current?.();
      fallbackStopRef.current = null;
      void fallbackCtxRef.current?.close();
      fallbackCtxRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        audioRef.current?.pause();
        fallbackStopRef.current?.();
        fallbackStopRef.current = null;
      } else if (wantPlayRef.current) {
        void startPlayback()
          .then(() => setPlaying(true))
          .catch(() => {
            /* still needs a user tap */
          });
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startPlayback() {
    if (useFallbackRef.current) {
      if (!fallbackCtxRef.current) {
        fallbackCtxRef.current = new AudioContext();
      }
      const ctx = fallbackCtxRef.current;
      if (ctx.state === "suspended") await ctx.resume();
      if (!fallbackStopRef.current) {
        fallbackStopRef.current = createFallbackLullaby(ctx).stop;
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      useFallbackRef.current = true;
      return startPlayback();
    }
    try {
      await audio.play();
    } catch (err) {
      // Decode/network failure → Web Audio fallback. Autoplay policy → rethrow
      // so the caller can keep UI off until a real tap.
      if (audio.error) {
        useFallbackRef.current = true;
        await startPlayback();
        return;
      }
      throw err;
    }
  }

  function stopPlayback() {
    audioRef.current?.pause();
    fallbackStopRef.current?.();
    fallbackStopRef.current = null;
  }

  async function toggle() {
    if (playing) {
      wantPlayRef.current = false;
      stopPlayback();
      setPlaying(false);
      try {
        sessionStorage.setItem(STORAGE_KEY, "0");
      } catch {
        /* ignore */
      }
      return;
    }

    wantPlayRef.current = true;
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    try {
      await startPlayback();
      setPlaying(true);
    } catch {
      wantPlayRef.current = false;
      setPlaying(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      aria-pressed={playing}
      aria-label={playing ? "Pause soft music" : "Play soft music"}
      title={playing ? "Pause music" : "Play soft music"}
      className={`music-toggle group fixed bottom-4 right-4 z-50 flex size-11 items-center justify-center rounded-full border border-white/80 bg-white/75 text-[var(--blush-deep)] shadow-[0_10px_28px_-12px_rgba(47,61,52,0.45)] backdrop-blur-md transition hover:bg-white/90 hover:text-[var(--leaf-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)]/50 sm:bottom-5 sm:right-5 sm:size-12 ${className}`}
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
  );
}
