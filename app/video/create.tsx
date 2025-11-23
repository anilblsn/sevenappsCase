import { MetadataForm } from '@/components/MetadataForm';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useTrimVideo } from '@/hooks/useVideoQueries';
import { VideoMetadataFormData } from '@/lib/validation';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { cssInterop } from 'nativewind';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

cssInterop(LinearGradient, {
  className: 'style',
});

type Step = 'select' | 'crop' | 'metadata';

const steps = [
  { key: 'select' as Step, title: 'Select Video', icon: 'videocam-outline' },
  { key: 'crop' as Step, title: 'Crop Video', icon: 'cut-outline' },
  { key: 'metadata' as Step, title: 'Add Details', icon: 'document-text-outline' },
];

export default function CreateVideoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('select');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  const trimVideoMutation = useTrimVideo();

  const handleSelectVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your media library.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedVideo(result.assets[0].uri);
        setStep('crop');
      }
    } catch (error) {
      console.error('Error selecting video:', error);
      Alert.alert('Error', 'Failed to select video. Please try again.');
    }
  };

  const handleTimeSelect = (start: number, end: number) => {
    setStartTime(start);
    setEndTime(end);
  };

  const handleMetadataSubmit = async (data: VideoMetadataFormData) => {
    if (!selectedVideo) return;

    try {
      await trimVideoMutation.mutateAsync({
        originalUri: selectedVideo,
        startTime,
        endTime,
        name: data.name,
        description: data.description,
      });

      Alert.alert('Success', 'Video cropped and saved successfully!', [
        {
          text: 'OK',
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error('Error cropping video:', error);
      Alert.alert('Error', 'Failed to crop video. Please try again.');
    }
  };

  const handleBack = () => {
    if (step === 'metadata') {
      setStep('crop');
    } else if (step === 'crop') {
      setStep('select');
      setSelectedVideo(null);
    } else {
      router.back();
    }
  };

  const handleNext = () => {
    if (step === 'crop') {
      setStep('metadata');
    }
  };

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1"
      >
        {/* Header with Gradient Accent */}
        <View className="px-5 pb-3" style={{ paddingTop: insets.top + 12 }}>
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handleBack}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 items-center justify-center border border-purple-400/30"
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="#A78BFA" />
            </TouchableOpacity>
            <Text className="text-base font-semibold text-white">
              {steps[currentStepIndex]?.title}
            </Text>
            <View className="w-10" />
          </View>

          {/* Colorful Progress Indicator */}
          <View className="flex-row mt-4 gap-1.5">
            {steps.map((_, index) => (
              <LinearGradient
                key={index}
                colors={
                  index <= currentStepIndex
                    ? ['#8B5CF6', '#EC4899', '#F59E0B']
                    : ['#ffffff33', '#ffffff33']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-1 flex-1 rounded-full"
              />
            ))}
          </View>
        </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24, flexGrow: 1 }}
      >
        <View>
          {step === 'select' && (
            <Animated.View
              entering={SlideInRight.duration(300)}
              exiting={SlideOutLeft.duration(200)}
              className="flex-1 items-center px-6 pt-8"
            >
              {/* Hero Icon with Gradient */}
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-24 h-24 rounded-3xl items-center justify-center mb-8 shadow-lg shadow-purple-500/50"
              >
                <Ionicons name="videocam" size={48} color="white" />
              </LinearGradient>

              <Text className="text-2xl font-bold text-white mb-2 text-center">
                Import Video
              </Text>
              <Text className="text-sm text-gray-300 mb-10 text-center px-8 leading-5">
                Select a video to trim into a 5-second clip
              </Text>

              {/* CTA Button with Gradient */}
              <TouchableOpacity
                onPress={handleSelectVideo}
                className="w-full rounded-2xl mb-8 overflow-hidden"
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-4 shadow-lg shadow-purple-500/30"
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="add-circle-outline" size={24} color="white" />
                    <Text className="text-white font-semibold text-base ml-2">
                      Choose from Gallery
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Colorful Features */}
              <View className="w-full space-y-3">
                <LinearGradient
                  colors={['#8B5CF620', '#3B82F620']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="flex-row items-center rounded-xl p-4 border border-purple-400/30"
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#3B82F6']}
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  >
                    <Ionicons name="cut" size={20} color="white" />
                  </LinearGradient>
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-sm">
                      Precision Trimming
                    </Text>
                    <Text className="text-gray-300 text-xs mt-0.5">
                      Frame-accurate 5-second clips
                    </Text>
                  </View>
                </LinearGradient>

                <LinearGradient
                  colors={['#EC489920', '#F59E0B20']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="flex-row items-center rounded-xl p-4 border border-pink-400/30"
                >
                  <LinearGradient
                    colors={['#EC4899', '#F59E0B']}
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  >
                    <Ionicons name="bookmark" size={20} color="white" />
                  </LinearGradient>
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-sm">
                      Smart Organization
                    </Text>
                    <Text className="text-gray-300 text-xs mt-0.5">
                      Tag and categorize your clips
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </Animated.View>
          )}

          {step === 'crop' && selectedVideo && (
            <Animated.View
              entering={SlideInRight.duration(300)}
              exiting={SlideOutLeft.duration(200)}
              className="flex-1 px-4 pt-2"
            >
              <VideoPlayer
                uri={selectedVideo}
                onTimeSelect={handleTimeSelect}
              />

              {/* Gradient Action Button */}
              <TouchableOpacity
                onPress={handleNext}
                className="mt-6 rounded-2xl overflow-hidden"
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-4 shadow-lg shadow-purple-500/30"
                >
                  <View className="flex-row items-center justify-center">
                    <Text className="text-white font-semibold text-base mr-2">
                      Continue
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Colorful Tip */}
              <LinearGradient
                colors={['#3B82F620', '#8B5CF620']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="mt-4 flex-row items-start rounded-xl p-3.5 border border-blue-400/30"
              >
                <Ionicons name="bulb" size={18} color="#60A5FA" />
                <Text className="flex-1 text-xs text-gray-200 leading-4 ml-2.5">
                  Drag the slider to find the perfect 5-second moment
                </Text>
              </LinearGradient>
            </Animated.View>
          )}

          {step === 'metadata' && (
            <Animated.View
              entering={SlideInRight.duration(300)}
              exiting={SlideOutLeft.duration(200)}
              className="flex-1 px-4 pt-2"
            >
              {/* Gradient Info Banner */}
              <LinearGradient
                colors={['#10B98120', '#3B82F620']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-xl p-4 mb-6 border border-emerald-400/30"
              >
                <View className="flex-row items-start">
                  <LinearGradient
                    colors={['#10B981', '#3B82F6']}
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  >
                    <Ionicons name="create" size={20} color="white" />
                  </LinearGradient>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-white mb-1">
                      Add Details
                    </Text>
                    <Text className="text-xs text-gray-200 leading-4">
                      Name and describe your clip for easy discovery
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              <MetadataForm
                onSubmit={handleMetadataSubmit}
                isLoading={trimVideoMutation.isPending}
              />
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Colorful Loading Overlay */}
      {trimVideoMutation.isPending && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/90 items-center justify-center">
          <LinearGradient
            colors={['#1a1a2e', '#16213e']}
            className="border border-purple-400/30 p-8 rounded-3xl items-center mx-8"
          >
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              className="w-16 h-16 rounded-full items-center justify-center mb-5"
            >
              <ActivityIndicator size="large" color="white" />
            </LinearGradient>
            <Text className="text-white font-semibold text-lg mb-2">
              Processing Video
            </Text>
            <Text className="text-gray-300 text-sm text-center leading-5">
              Creating your 5-second clip...
            </Text>
          </LinearGradient>
        </View>
      )}
      </LinearGradient>
    </>
  );
}
