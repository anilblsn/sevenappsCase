import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VideoEntry } from '@/types/video';

interface VideoStore {
  videos: VideoEntry[];
  addVideo: (video: VideoEntry) => void;
  updateVideo: (id: string, updates: Partial<VideoEntry>) => void;
  deleteVideo: (id: string) => void;
  getVideo: (id: string) => VideoEntry | undefined;
}

export const useVideoStore = create<VideoStore>()(
  persist(
    (set, get) => ({
      videos: [],
      addVideo: (video) =>
        set((state) => ({
          videos: [...state.videos, video],
        })),
      updateVideo: (id, updates) =>
        set((state) => ({
          videos: state.videos.map((video) =>
            video.id === id ? { ...video, ...updates } : video
          ),
        })),
      deleteVideo: (id) =>
        set((state) => ({
          videos: state.videos.filter((video) => video.id !== id),
        })),
      getVideo: (id) => get().videos.find((video) => video.id === id),
    }),
    {
      name: 'video-diary-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

