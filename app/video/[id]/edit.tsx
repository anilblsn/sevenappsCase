import { MetadataForm } from '@/components/MetadataForm';
import { useUpdateVideo } from '@/hooks/useVideoQueries';
import { getVideoById } from '@/lib/database';
import { VideoMetadataFormData } from '@/lib/validation';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditVideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const updateVideoMutation = useUpdateVideo();

  const { data: video, isLoading } = useQuery({
    queryKey: ['video', id],
    queryFn: () => getVideoById(id!),
    enabled: !!id,
  });

  const handleSubmit = async (data: VideoMetadataFormData) => {
    if (!id) return;

    try {
      await updateVideoMutation.mutateAsync({
        id,
        updates: data,
      });

      Alert.alert('Success', 'Video details updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error updating video:', error);
      Alert.alert('Error', 'Failed to update video. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <View className="w-20 h-20 rounded-full bg-blue-50 items-center justify-center mb-4 shadow-lg" style={{ shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
        <Text className="text-gray-500 font-semibold text-base">Loading video...</Text>
      </View>
    );
  }

  if (!video) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50" style={{ paddingTop: insets.top, paddingBottom: insets.bottom, paddingHorizontal: 32 }}>
        <View className="w-32 h-32 rounded-full bg-red-50 items-center justify-center mb-6 shadow-lg" style={{ shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 }}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
        </View>
        <Text className="text-[28px] font-bold text-gray-900 mb-3 text-center">Video not found</Text>
        <Text className="text-gray-500 text-center mb-8 text-[15px] leading-[22px]">Unable to load video details</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-blue-500 px-10 py-4 rounded-2xl shadow-lg"
          style={{ shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <Ionicons name="arrow-back" size={20} color="white" />
            <Text className="text-white font-bold text-[17px] ml-2">Go Back</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-gray-50">
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#3B82F6', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pb-6 px-5"
          style={{ paddingTop: insets.top + 16 }}
        >
          <View className="flex-row items-center mb-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-3 rounded-3xl mr-3"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white text-center">Edit Video</Text>
            </View>
            <View className="w-12" />
          </View>
          <Text className="text-blue-100 text-[15px] ml-[60px] leading-[22px] font-medium">
            Update your video's name and description
          </Text>
        </LinearGradient>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        >
          <Animated.View entering={FadeIn.duration(300)} className="px-5 pt-5">
            {/* Info Banner */}
            <Animated.View entering={FadeInDown.delay(100).springify()} className="bg-blue-50 rounded-[20px] p-5 mb-6 border border-blue-100 shadow-md flex-row items-start" style={{ shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }}>
              <View className="w-12 h-12 rounded-3xl bg-blue-500 items-center justify-center mr-4 shadow-lg" style={{ shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 }}>
                <Ionicons name="create" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900 mb-2">Edit Details</Text>
                <Text className="text-sm text-gray-500 leading-[22px]">
                  Update the name and description to better organize your video collection
                </Text>
              </View>
            </Animated.View>

            <MetadataForm
              onSubmit={handleSubmit}
              initialData={{
                name: video.name,
                description: video.description,
              }}
              isLoading={updateVideoMutation.isPending}
              submitButtonText="Save Changes"
            />
          </Animated.View>
        </ScrollView>
      </View>
    </>
  );
}
