import { create } from "zustand";

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  liveTranscript: { speaker: string; text: string; timestamp: number }[];
  waveformData: number[];

  startRecording: () => void;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  setDuration: (duration: number) => void;
  incrementDuration: () => void;
  setAudioBlob: (blob: Blob | null) => void;
  setAudioUrl: (url: string | null) => void;
  addTranscriptSegment: (segment: { speaker: string; text: string; timestamp: number }) => void;
  clearTranscript: () => void;
  setWaveformData: (data: number[]) => void;
  reset: () => void;
}

export const useRecordingStore = create<RecordingState>((set) => ({
  isRecording: false,
  isPaused: false,
  duration: 0,
  audioBlob: null,
  audioUrl: null,
  liveTranscript: [],
  waveformData: [],

  startRecording: () => set({ isRecording: true, isPaused: false }),
  stopRecording: () => set({ isRecording: false, isPaused: false }),
  pauseRecording: () => set({ isPaused: true }),
  resumeRecording: () => set({ isPaused: false }),
  setDuration: (duration) => set({ duration }),
  incrementDuration: () => set((state) => ({ duration: state.duration + 1 })),
  setAudioBlob: (blob) => set({ audioBlob: blob }),
  setAudioUrl: (url) => set({ audioUrl: url }),
  addTranscriptSegment: (segment) =>
    set((state) => ({ liveTranscript: [...state.liveTranscript, segment] })),
  clearTranscript: () => set({ liveTranscript: [] }),
  setWaveformData: (data) => set({ waveformData: data }),
  reset: () =>
    set({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
      liveTranscript: [],
      waveformData: [],
    }),
}));
