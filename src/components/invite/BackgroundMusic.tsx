import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const controlRef = useRef<HTMLButtonElement>(null);
  const wantsMusic = useRef(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.35;
    const start = (event?: Event) => {
      if (event?.target instanceof Node && controlRef.current?.contains(event.target)) return;
      if (wantsMusic.current && audio.paused) void audio.play().catch(() => {});
    };
    start();
    // Retry inside a real user gesture when the browser blocks audible autoplay.
    document.addEventListener("click", start);
    document.addEventListener("keydown", start);
    return () => {
      document.removeEventListener("click", start);
      document.removeEventListener("keydown", start);
      audio.pause();
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      wantsMusic.current = false;
      audio.pause();
    } else {
      wantsMusic.current = true;
      void audio.play().catch(() => {});
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        autoPlay
        loop
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setPlaying(false)}
      >
        <source src="/audio/ajab-si.m4a" type="audio/mp4" />
        <source src="/audio/ajab-si.mp3" type="audio/mpeg" />
      </audio>
      <button
        ref={controlRef}
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause background music" : "Play background music"}
        title={playing ? "Pause Ajab Si" : "Play Ajab Si"}
        className="music-control fixed z-[100] flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-primary/20 bg-white text-primary shadow-sm focus-visible:outline-2 focus-visible:outline-primary"
      >
        {playing ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </button>
    </>
  );
}
