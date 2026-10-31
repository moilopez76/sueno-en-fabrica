"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Album, ImageAsset, Track } from "@/lib/content-types";

export interface PlayableTrack extends Track {
  albumSlug: string;
  albumTitle: string;
  cover: ImageAsset;
}

export type RepeatMode = "off" | "all" | "one";

interface AudioContextValue {
  queue: PlayableTrack[];
  currentIndex: number;
  currentTrack: PlayableTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  error: string | null;
  playAlbum: (album: Album, startIndex?: number) => void;
  playAll: (albums: Album[]) => void;
  playTrackFromQueue: (index: number) => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (value: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

function toPlayable(album: Album): PlayableTrack[] {
  return album.tracks.map((t) => ({ ...t, albumSlug: album.slug, albumTitle: album.title, cover: album.cover }));
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<PlayableTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [error, setError] = useState<string | null>(null);

  const currentTrack = currentIndex >= 0 ? (queue[currentIndex] ?? null) : null;

  // Create the single underlying <audio> element once.
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const startQueue = useCallback((tracks: PlayableTrack[], startIndex: number) => {
    setError(null);
    setQueue(tracks);
    setCurrentIndex(startIndex);
    setIsPlaying(true);
  }, []);

  const playAlbum = useCallback(
    (album: Album, startIndex = 0) => {
      const tracks = toPlayable(album);
      if (tracks.length === 0) return;
      startQueue(shuffle ? shuffleArray(tracks) : tracks, shuffle ? 0 : startIndex);
    },
    [shuffle, startQueue],
  );

  const playAll = useCallback(
    (albums: Album[]) => {
      const tracks = albums.flatMap(toPlayable);
      if (tracks.length === 0) return;
      startQueue(shuffle ? shuffleArray(tracks) : tracks, 0);
    },
    [shuffle, startQueue],
  );

  const playTrackFromQueue = useCallback((index: number) => {
    setError(null);
    setCurrentIndex(index);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    setIsPlaying((p) => !p);
  }, [currentTrack]);

  const next = useCallback(() => {
    setCurrentIndex((i) => {
      if (queue.length === 0) return i;
      if (i + 1 < queue.length) return i + 1;
      return repeat === "all" ? 0 : i;
    });
    setIsPlaying(true);
  }, [queue.length, repeat]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setCurrentIndex((i) => {
      if (queue.length === 0) return i;
      if (i - 1 >= 0) return i - 1;
      return repeat === "all" ? queue.length - 1 : 0;
    });
    setIsPlaying(true);
  }, [queue.length, repeat]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((value: number) => {
    setVolumeState(value);
    if (audioRef.current) audioRef.current.volume = value;
  }, []);

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);
  const cycleRepeat = useCallback(() => {
    setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));
  }, []);

  // Load the current track into the <audio> element whenever it changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    setIsLoading(true);
    setError(null);
    audio.src = currentTrack.localAudioSrc || currentTrack.audioSrc;
    audio.load();
    if (isPlaying) {
      audio.play().catch(() => {
        // Autoplay can be blocked until a user gesture; the user can press play again.
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, currentTrack?.file]);

  // Keep the element's play/pause state in sync.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // Wire up native <audio> events.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };
    const onEnded = () => {
      if (repeat === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      next();
    };
    const onError = () => {
      setIsLoading(false);
      setError(currentTrack ? `Impossible de lire « ${currentTrack.title} ».` : "Erreur de lecture.");
      // Skip the broken track automatically so the queue keeps moving.
      if (queue.length > 1) next();
      else setIsPlaying(false);
    };
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next, repeat, queue.length, currentTrack]);

  // Media Session API for lock-screen / OS media controls.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (!currentTrack) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: "Sueño en la Fábrica",
      album: currentTrack.albumTitle,
      artwork: currentTrack.cover.localSrc
        ? [{ src: currentTrack.cover.localSrc, sizes: "512x512", type: "image/jpeg" }]
        : [],
    });
    navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true));
    navigator.mediaSession.setActionHandler("pause", () => setIsPlaying(false));
    navigator.mediaSession.setActionHandler("previoustrack", previous);
    navigator.mediaSession.setActionHandler("nexttrack", next);
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime !== undefined) seek(details.seekTime);
    });
  }, [currentTrack, next, previous, seek]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  const value = useMemo<AudioContextValue>(
    () => ({
      queue,
      currentIndex,
      currentTrack,
      isPlaying,
      isLoading,
      currentTime,
      duration,
      volume,
      shuffle,
      repeat,
      error,
      playAlbum,
      playAll,
      playTrackFromQueue,
      togglePlay,
      next,
      previous,
      seek,
      setVolume,
      toggleShuffle,
      cycleRepeat,
    }),
    [
      queue,
      currentIndex,
      currentTrack,
      isPlaying,
      isLoading,
      currentTime,
      duration,
      volume,
      shuffle,
      repeat,
      error,
      playAlbum,
      playAll,
      playTrackFromQueue,
      togglePlay,
      next,
      previous,
      seek,
      setVolume,
      toggleShuffle,
      cycleRepeat,
    ],
  );

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used within an AudioProvider");
  return ctx;
}
