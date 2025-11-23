import { VideoEntry } from '@/types/video';
import { trimVideo as trimVideoNative } from 'expo-trim-video';

export interface TrimVideoOptions {
  uri: string;
  startTime: number;
  endTime: number;
  outputUri?: string;
}


export const trimVideo = async (
  options: TrimVideoOptions
): Promise<string> => {
  const { uri, startTime, endTime } = options;

  try {
    console.log('Trimming video:', {
      uri,
      start: startTime,
      end: endTime
    });

    const result = await trimVideoNative({
      uri: uri,
      start: startTime, 
      end: endTime,     
    });

    return result.uri;
  } catch (error) {
    console.error('Error trimming video:', error);
    throw new Error(`Failed to trim video: ${error}`);
  }
};


export const createVideoEntry = async (
  originalUri: string,
  startTime: number,
  endTime: number,
  name: string,
  description: string
): Promise<VideoEntry> => {
  const croppedUri = await trimVideo({
    uri: originalUri,
    startTime,
    endTime,
  });

  const now = new Date().toISOString();

  return {
    id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    originalUri,
    croppedUri,
    startTime,
    endTime,
    duration: endTime - startTime,
    createdAt: now,
    updatedAt: now,
  };
};

