export interface VideoEntry {
  id: string;
  name: string;
  description: string;
  originalUri: string;
  croppedUri: string;
  startTime: number;
  endTime: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export interface VideoMetadata {
  name: string;
  description: string;
}

