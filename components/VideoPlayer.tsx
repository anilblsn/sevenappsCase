import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, useVideoPlayer } from 'expo-video';
import { cssInterop } from 'nativewind';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Text, TouchableOpacity, View } from 'react-native';

cssInterop(LinearGradient, {
  className: 'style',
});

interface VideoPlayerProps {
  uri: string;
  onTimeSelect: (startTime: number, endTime: number) => void;
  minDuration?: number;
  maxDuration?: number;
}

const SEGMENT_DURATION = 5; // 5 seconds
const { width } = Dimensions.get('window');

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  uri,
  onTimeSelect,
  minDuration = 0,
  maxDuration = Infinity,
}) => {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = false;
    player.muted = false;
  });

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(SEGMENT_DURATION);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (player) {
      const updateDuration = () => {
        const videoDuration = player.duration || 0;
        if (videoDuration > 0) {
          setDuration(videoDuration);
          const maxEnd = Math.min(videoDuration, SEGMENT_DURATION);
          setEndTime(maxEnd);
        }
      };

      if (player.duration > 0) {
        updateDuration();
      }

      intervalRef.current = setInterval(() => {
        if (player) {
          const time = player.currentTime || 0;
          setCurrentTime(time);
          setIsPlaying(player.playing);

          // Auto-pause when reaching end time (only in preview mode)
          if (isPreviewMode && player.playing && time >= endTime - 0.1) {
            player.pause();
            setIsPreviewMode(false);
          }

          if (player.duration > 0 && duration === 0) {
            updateDuration();
          }
        }
      }, 100);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [player, duration, endTime, isPreviewMode]);

  useEffect(() => {
    if (duration > 0) {
      const calculatedEndTime = startTime + SEGMENT_DURATION;
      const finalEndTime = Math.min(calculatedEndTime, duration);
      setEndTime(finalEndTime);
      onTimeSelect(startTime, finalEndTime);
    }
  }, [startTime, duration, onTimeSelect]);

  const handleStartTimeChange = (value: number) => {
    if (duration > 0) {
      const newStartTime = Math.max(0, Math.min(value, duration - SEGMENT_DURATION));
      setStartTime(newStartTime);
      if (player) {
        player.currentTime = newStartTime;
      }
    }
  };

  const handleSeek = (value: number) => {
    if (player) {
      player.currentTime = value;
      setCurrentTime(value);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (player) {
      if (isPlaying) {
        player.pause();
      } else {
        setIsPreviewMode(false);
        player.play();
      }
    }
  };

  const handlePreview = () => {
    if (player) {
      setIsPreviewMode(true);
      player.currentTime = startTime;
      player.play();
    }
  };

  if (!player) {
    return (
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        className="h-[400px] items-center justify-center rounded-2xl border border-purple-400/30"
      >
        <LinearGradient
          colors={['#8B5CF6', '#EC4899']}
          className="w-16 h-16 rounded-full items-center justify-center mb-4"
        >
          <ActivityIndicator size="large" color="white" />
        </LinearGradient>
        <Text className="text-gray-200 text-sm font-medium">Loading video...</Text>
      </LinearGradient>
    );
  }

  const segmentWidth = duration > 0 ? ((endTime - startTime) / duration) * 100 : 0;
  const segmentLeft = duration > 0 ? (startTime / duration) * 100 : 0;
  const currentPosition = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <View className="w-full">
      {/* Video Container */}
      <View className="h-[400px] bg-black rounded-2xl overflow-hidden mb-4 border border-white/10">
        <VideoView
          player={player}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
          nativeControls={false}
        />

        {/* Play/Pause Overlay */}
        <TouchableOpacity
          onPress={handlePlayPause}
          className="absolute inset-0 items-center justify-center"
          activeOpacity={0.8}
        >
          <View className="w-14 h-14 rounded-full bg-black/70 items-center justify-center border-2 border-white/20 backdrop-blur">
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color="white"
              style={{ marginLeft: isPlaying ? 0 : 2 }}
            />
          </View>
        </TouchableOpacity>

        {/* Time Display */}
        <View className="absolute bottom-4 left-4 right-4 flex-row justify-between items-center">
          <View className="bg-black/80 px-3 py-1.5 rounded-lg backdrop-blur">
            <Text className="text-white text-xs font-semibold">
              {formatTime(currentTime)}
            </Text>
          </View>
          <View className="bg-black/80 px-3 py-1.5 rounded-lg backdrop-blur">
            <Text className="text-white text-xs font-semibold">
              {formatTime(duration)}
            </Text>
          </View>
        </View>
      </View>

      {/* Colorful Timeline Section */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        className="rounded-2xl p-4 mb-4 border border-purple-400/30"
      >
        {/* Time Info with Gradients */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-1 items-center">
            <Text className="text-[10px] text-gray-400 mb-1.5 font-medium uppercase tracking-wider">Start</Text>
            <LinearGradient
              colors={['#8B5CF6', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="px-3 py-1.5 rounded-lg"
            >
              <Text className="text-sm font-bold text-white">
                {formatTime(startTime)}
              </Text>
            </LinearGradient>
          </View>

          <View className="flex-1 items-center">
            <LinearGradient
              colors={['#EC4899', '#F59E0B']}
              className="w-12 h-12 rounded-full items-center justify-center"
            >
              <Text className="text-white font-bold text-sm">{SEGMENT_DURATION}s</Text>
            </LinearGradient>
          </View>

          <View className="flex-1 items-center">
            <Text className="text-[10px] text-gray-400 mb-1.5 font-medium uppercase tracking-wider">End</Text>
            <LinearGradient
              colors={['#3B82F6', '#10B981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="px-3 py-1.5 rounded-lg"
            >
              <Text className="text-sm font-bold text-white">
                {formatTime(endTime)}
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Colorful Timeline Visualization */}
        <View className="mb-4">
          <View className="h-2 bg-white/10 rounded-full overflow-hidden">
            {/* Selected Segment with Gradient */}
            <LinearGradient
              colors={['#8B5CF6', '#EC4899', '#F59E0B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="absolute h-2 rounded-full"
              style={{
                left: `${segmentLeft}%`,
                width: `${segmentWidth}%`,
              }}
            />
            {/* Playhead */}
            <View
              className="absolute h-2 w-0.5 bg-white shadow-lg shadow-white/50"
              style={{
                left: `${currentPosition}%`,
              }}
            />
          </View>

          {/* Time Labels */}
          <View className="flex-row justify-between mt-1.5">
            <Text className="text-[10px] text-gray-400">0:00</Text>
            <Text className="text-[10px] text-gray-400">{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Trim Slider */}
        <View>
          <Text className="text-xs text-gray-300 mb-2">Adjust trim position</Text>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={Math.max(0, duration - SEGMENT_DURATION)}
            value={startTime}
            onValueChange={handleStartTimeChange}
            minimumTrackTintColor="#EC4899"
            maximumTrackTintColor="#3F3F46"
            thumbTintColor="#EC4899"
          />
        </View>
      </LinearGradient>

      {/* Gradient Control Buttons */}
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={handlePreview}
          className="flex-1 rounded-xl overflow-hidden"
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#8B5CF6', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-3.5"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons
                name="play"
                size={20}
                color="white"
              />
              <Text className="text-white font-semibold text-sm ml-2">
                Preview 5s
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (player) {
              setIsPreviewMode(true);
              player.currentTime = startTime;
              player.play();
            }
          }}
          className="flex-1 rounded-xl overflow-hidden"
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#10B981', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-3.5"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="reload-outline" size={20} color="white" />
              <Text className="text-white font-semibold text-sm ml-2">Replay</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};
