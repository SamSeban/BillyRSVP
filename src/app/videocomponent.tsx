import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * RSVPVideoGate
 * A drop-in component for React + Tailwind + TypeScript that:
 * 1) Shows a custom Play button overlay so audio can start on user gesture.
 * 2) Plays a video to completion with sound, with no user controls and no seeking.
 * 3) Reveals an RSVP form only after the video ends.
 *
 * Usage:
 * <RSVPVideoGate
 *   src="/video/intro.mp4"
 *   poster="/img/poster.jpg"
 *   title="Billy’s Bar‑Mitzvah"
 * />
 */
export default function RSVPVideoGate({
  src,
  poster,
  title = "You're Invited!",
  className = "",
}: {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
}) {
  const [phase, setPhase] = useState<"intro" | "playing" | "done">("intro");
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const shieldRef = useRef<HTMLDivElement | null>(null);
  const lastTrustedTimeRef = useRef(0);
  const seekingGuardRef = useRef(false);

  // Prevent keyboard seeking (space/arrow keys) when playing
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase !== "playing") return;
      const blocked = [
        " ",
        "Spacebar",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ];
      if (blocked.includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () => window.removeEventListener("keydown", handler, { capture: true });
  }, [phase]);

  const startPlayback = async () => {
    setError(null);
    setPhase("playing");

    const v = videoRef.current;
    if (!v) return;

    // Make sure we start unmuted (allowed because it's a user gesture)
    v.muted = false;
    v.volume = 1.0;
    v.playsInline = true; // iOS inline

    try {
      await v.play();
      // Immediately put an invisible shield over the video to block clicks/taps (prevents pause/seeking UI on some mobile browsers)
      shieldRef.current?.focus();
    } catch {
      // If autoplay with sound fails for any reason, fall back to showing a tiny inline unmute hint
      setError("Tap to unmute and play");
      try {
        v.muted = true;
        await v.play();
        // Then attempt to unmute right away — some browsers allow if still in gesture
        v.muted = false;
      } catch {
        // As a last resort keep it muted so at least it plays. User can click again.
        v.muted = true;
      }
    }
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    // Store the last trusted time every ~250ms of progress
    if (!seekingGuardRef.current) {
      lastTrustedTimeRef.current = v.currentTime;
    }
  };

  const onSeeking = () => {
    const v = videoRef.current;
    if (!v) return;
    // If a seek is attempted, snap back to the last trusted time
    const delta = Math.abs(v.currentTime - lastTrustedTimeRef.current);
    if (delta > 0.2) {
      seekingGuardRef.current = true;
      v.currentTime = lastTrustedTimeRef.current;
      // brief guard to avoid feedback with timeupdate
      setTimeout(() => (seekingGuardRef.current = false), 50);
    }
  };

  const onEnded = () => {
    setPhase("done");
  };

  return (
    <div className={"w-full max-w-3xl mx-auto " + className}>
      {/* Header / Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h1>
        {phase !== "done" && (
          <p className="text-sm text-muted-foreground mt-1">Tap play to continue with sound</p>
        )}
      </div>

      {/* Intro: Poster with Custom Play Button */}
      {phase === "intro" && (
        <button
          aria-label="Play video"
          onClick={startPlayback}
          className="group relative w-full aspect-video overflow-hidden rounded-2xl shadow-md focus:outline-none focus:ring-4 focus:ring-blue-400"
        >
          {/* Poster */}
          <Image
            src={poster || "/poster-fallback.jpg"}
            alt="Video poster"
            fill
            className="object-cover"
            draggable={false}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/10" />
          {/* Custom Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-xl ring-1 ring-black/10 transition group-hover:scale-105">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="translate-x-0.5 text-black/90">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>
        </button>
      )}

      {/* Playing: Video without controls + interaction shield */}
      {phase === "playing" && (
        <div className="relative w-full aspect-video overflow-hidden rounded-2xl shadow-md">
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className="h-full w-full object-cover select-none pointer-events-none"
            playsInline
            // No native controls; we block pointer events so clicks don't pause
            controls={false}
            preload="auto"
            onTimeUpdate={onTimeUpdate}
            onSeeking={onSeeking}
            onEnded={onEnded}
            onContextMenu={(e) => e.preventDefault()}
          />
          {/* Shield to block interactions & accidental pauses. It's focusable to catch keys. */}
          <div
            ref={shieldRef}
            tabIndex={0}
            aria-hidden
            className="absolute inset-0 outline-none"
            onKeyDown={(e) => {
              // double protection, also here
              e.preventDefault();
              e.stopPropagation();
            }}
            onDoubleClick={(e) => {
              // prevent iOS double-tap to seek
              e.preventDefault();
              e.stopPropagation();
            }}
          />
          {error && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Done: RSVP Form */}
      {phase === "done" && <RSVPForm />}
    </div>
  );
}

function RSVPForm() {
  // Replace with your actual form submission logic / embed.
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      // Fake latency
      await new Promise((r) => setTimeout(r, 700));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="mt-6 rounded-2xl border bg-green-50 p-6 text-green-900">
        <h2 className="text-xl font-semibold">Merci !</h2>
        <p className="mt-1 text-sm">Votre réponse a bien été enregistrée. On a hâte de vous voir 🎉</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 grid gap-4 rounded-2xl border bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold">RSVP</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm text-muted-foreground">Prénom</span>
          <input
            required
            type="text"
            className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
            name="firstName"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-muted-foreground">Nom</span>
          <input
            required
            type="text"
            className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
            name="lastName"
          />
        </label>
      </div>
      <label className="grid gap-1">
        <span className="text-sm text-muted-foreground">Email</span>
        <input
          required
          type="email"
          className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
          name="email"
        />
      </label>
      <label className="grid gap-1">
        <span className="text-sm text-muted-foreground">Nombre d&apos;invités</span>
        <input
          required
          min={1}
          defaultValue={1}
          type="number"
          className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
          name="guests"
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-white transition active:scale-[.98]"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Envoi…" : "Envoyer"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-600">Oups, une erreur est survenue. Merci de réessayer.</p>
      )}
    </form>
  );
}
