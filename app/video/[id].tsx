import { getVideoById } from '@/lib/database';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { cssInterop } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

cssInterop(LinearGradient, {
  className: 'style',
});

export default function VideoDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: video, isLoading } = useQuery({
    queryKey: ['video', id],
    queryFn: () => getVideoById(id!),
    enabled: !!id,
  });

  const player = useVideoPlayer(video?.croppedUri ?? '', (player) => {
    player.loop = true;
    player.muted = false;
  });

  useEffect(() => {
    if (player && video?.croppedUri) {
      const interval = setInterval(() => {
        setIsPlaying(player.playing);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [player, video?.croppedUri]);

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        className="flex-1 items-center justify-center"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <LinearGradient
          colors={['#8B5CF6', '#EC4899']}
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
        >
          <ActivityIndicator size="large" color="white" />
        </LinearGradient>
        <Text className="text-white font-semibold text-lg">Loading video...</Text>
      </LinearGradient>
    );
  }

  if (!video) {
    return (
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        className="flex-1 items-center justify-center px-8"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <LinearGradient
          colors={['#EF4444', '#DC2626']}
          className="w-32 h-32 rounded-full items-center justify-center mb-6"
        >
          <Ionicons name="alert-circle" size={64} color="white" />
        </LinearGradient>
        <Text className="text-3xl font-bold text-white mb-3">
          Video not found
        </Text>
        <Text className="text-gray-300 text-center mb-8 text-base leading-6">
          The video you're looking for doesn't exist or has been removed
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-2xl overflow-hidden"
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            className="px-10 py-4"
          >
            <View className="flex-row items-center">
              <Ionicons name="arrow-back" size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Go Back</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePlayPause = () => {
    if (player) {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        className="flex-1"
      >
        {/* Colorful Header */}
        <View style={{ paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 16 }}>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-3 border border-purple-400/30"
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="#A78BFA" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-white">
                Video Details
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        >
          <Animated.View entering={FadeIn.duration(300)}>
            {/* Video Player */}
            <View className="w-full bg-black h-[340px] relative">
              {player && video?.croppedUri ? (
                <>
                  <VideoView
                    player={player}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="contain"
                    nativeControls={false}
                  />

                  {/* Play/Pause Overlay */}
                  <TouchableOpacity
                    onPress={handlePlayPause}
                    className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center"
                    activeOpacity={0.8}
                  >
                    <Animated.View
                      entering={FadeInUp.springify()}
                      className="w-20 h-20 rounded-full bg-black/70 items-center justify-center border-[3px] border-white/30"
                    >
                      <Ionicons
                        name={isPlaying ? 'pause' : 'play'}
                        size={40}
                        color="white"
                        className={isPlaying ? '' : 'ml-1'}
                      />
                    </Animated.View>
                  </TouchableOpacity>
                </>
              ) : (
                <View className="flex-1 items-center justify-center bg-black">
                  <LinearGradient
                    colors={['#8B5CF6', '#EC4899']}
                    className="w-16 h-16 rounded-full items-center justify-center mb-3"
                  >
                    <ActivityIndicator size="large" color="white" />
                  </LinearGradient>
                  <Text className="text-gray-300 mt-3 text-sm">
                    Loading video...
                  </Text>
                </View>
              )}
            </View>

            {/* Content */}
            <View className="px-5 pt-6">
              {/* Title and Description Card */}
              <Animated.View
                entering={FadeInDown.delay(100).springify()}
              >
                <LinearGradient
                  colors={['#1a1a2e', '#16213e']}
                  className="rounded-2xl p-5 mb-4 border border-purple-400/30"
                >
                  <View className="flex-row items-center mb-3">
                    <LinearGradient
                      colors={['#8B5CF6', '#EC4899']}
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    >
                      <Ionicons name="videocam" size={20} color="white" />
                    </LinearGradient>
                    <Text className="text-xl font-bold text-white flex-1">
                      {video.name}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-300 leading-6 ml-13">
                    {video.description}
                  </Text>
                </LinearGradient>
              </Animated.View>

              {/* Metadata Card */}
              <Animated.View
                entering={FadeInDown.delay(200).springify()}
              >
                <LinearGradient
                  colors={['#1a1a2e', '#16213e']}
                  className="rounded-2xl p-5 mb-4 border border-blue-400/30"
                >

                  <View className="flex-row items-center mb-4">
                    <Ionicons name="information-circle" size={24} color="#60A5FA" />
                    <Text className="text-base font-bold text-white ml-2">
                      Video Information
                    </Text>
                  </View>

                  {/* Duration */}
                  <View className="flex-row items-center justify-between py-3 border-b border-white/10">
                    <View className="flex-row items-center">
                      <LinearGradient
                        colors={['#3B82F6', '#8B5CF6']}
                        className="w-9 h-9 rounded-full items-center justify-center mr-3"
                      >
                        <Ionicons name="time" size={18} color="white" />
                      </LinearGradient>
                      <Text className="text-gray-300 font-medium text-sm">Duration</Text>
                    </View>
                    <LinearGradient
                      colors={['#3B82F620', '#8B5CF620']}
                      className="px-3 py-1.5 rounded-lg"
                    >
                      <Text className="text-blue-400 font-bold text-sm">
                        {video.duration.toFixed(1)}s
                      </Text>
                    </LinearGradient>
                  </View>

                  {/* Segment */}
                  <View className="flex-row items-center justify-between py-3 border-b border-white/10">
                    <View className="flex-row items-center">
                      <LinearGradient
                        colors={['#EC4899', '#F59E0B']}
                        className="w-9 h-9 rounded-full items-center justify-center mr-3"
                      >
                        <Ionicons name="cut" size={18} color="white" />
                      </LinearGradient>
                      <Text className="text-gray-300 font-medium text-sm">Segment</Text>
                    </View>
                    <LinearGradient
                      colors={['#EC489920', '#F59E0B20']}
                      className="px-3 py-1.5 rounded-lg"
                    >
                      <Text className="text-pink-400 font-bold text-xs">
                        {video.startTime.toFixed(1)}s - {video.endTime.toFixed(1)}s
                      </Text>
                    </LinearGradient>
                  </View>

                  {/* Created Date */}
                  <View className="flex-row items-center justify-between pt-3">
                    <View className="flex-row items-center">
                      <LinearGradient
                        colors={['#10B981', '#3B82F6']}
                        className="w-9 h-9 rounded-full items-center justify-center mr-3"
                      >
                        <Ionicons name="calendar" size={18} color="white" />
                      </LinearGradient>
                      <Text className="text-gray-300 font-medium text-sm">Created</Text>
                    </View>
                    <Text className="text-white font-bold text-sm">
                      {formatDate(video.createdAt)}
                    </Text>
                  </View>
                </LinearGradient>
              </Animated.View>

              {/* Action Buttons */}
              <Animated.View entering={FadeInDown.delay(300).springify()}>
                <TouchableOpacity
                  onPress={() => router.push(`/video/${id}/edit`)}
                  className="rounded-2xl overflow-hidden mb-3"
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#EC4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="py-4 items-center flex-row justify-center"
                  >
                    <Ionicons name="create" size={22} color="white" />
                    <Text className="text-white font-bold text-base ml-2.5">
                      Edit Video Details
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.back()}
                  className="py-4 rounded-2xl items-center border border-white/20 bg-white/5"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="arrow-back" size={20} color="#A78BFA" />
                    <Text className="text-gray-200 font-semibold text-base ml-2">
                      Back to List
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}
