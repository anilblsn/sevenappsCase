import { deleteVideo, getAllVideos, insertVideo, updateVideo } from '@/lib/database';
import { createVideoEntry } from '@/lib/video-trim';
import { useVideoStore } from '@/store/videoStore';
import { VideoEntry } from '@/types/video';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useVideos = () => {
  return useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const dbVideos = await getAllVideos();
      const store = useVideoStore.getState();
      if (dbVideos.length > 0) {
        store.videos = dbVideos;
      }
      return dbVideos;
    },
  });
};

export const useTrimVideo = () => {
  const queryClient = useQueryClient();
  const addVideo = useVideoStore((state) => state.addVideo);

  return useMutation({
    mutationFn: async (data: {
      originalUri: string;
      startTime: number;
      endTime: number;
      name: string;
      description: string;
    }) => {
      const videoEntry = await createVideoEntry(
        data.originalUri,
        data.startTime,
        data.endTime,
        data.name,
        data.description
      );

      await insertVideo(videoEntry);
      addVideo(videoEntry);
      return videoEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
};

export const useUpdateVideo = () => {
  const queryClient = useQueryClient();
  const updateVideoStore = useVideoStore((state) => state.updateVideo);

  return useMutation({
    mutationFn: async (data: { id: string; updates: Partial<VideoEntry> }) => {
      const updates = {
        ...data.updates,
        updatedAt: new Date().toISOString(),
      };
      await updateVideo(data.id, updates);
      updateVideoStore(data.id, updates);
      return { id: data.id, ...updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
};

export const useDeleteVideo = () => {
  const queryClient = useQueryClient();
  const deleteVideoStore = useVideoStore((state) => state.deleteVideo);

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteVideo(id);
      deleteVideoStore(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
};

