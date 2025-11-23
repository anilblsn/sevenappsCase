import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useVideos, useDeleteVideo } from '@/hooks/useVideoQueries';
import { VideoEntry } from '@/types/video';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';

// Enable NativeWind support for LinearGradient
cssInterop(LinearGradient, {
  className: 'style',
});

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: videos, isLoading, refetch } = useVideos();
  const deleteVideoMutation = useDeleteVideo();

  const handleVideoPress = (video: VideoEntry) => {
    router.push(`/video/${video.id}`);
  };

  const handleDelete = (id: string, event: any) => {
    event.stopPropagation();
    deleteVideoMutation.mutate(id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderVideoItem = ({ item, index }: { item: VideoEntry; index: number }) => (
    <AnimatedTouchable
      entering={FadeInDown.delay(index * 50).springify()}
      onPress={() => handleVideoPress(item)}
      className="mb-3 mx-4"
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        className="rounded-2xl border border-purple-400/30 overflow-hidden"
      >
        <View className="flex-row p-4">
          {/* Colorful Thumbnail */}
          <LinearGradient
            colors={['#8B5CF6', '#EC4899', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-20 h-20 rounded-xl mr-3 justify-center items-center overflow-hidden"
          >
            <View className="absolute w-9 h-9 rounded-full bg-white/30 justify-center items-center backdrop-blur">
              <Ionicons name="play" size={20} color="white" style={{ marginLeft: 2 }} />
            </View>
            <View className="absolute bottom-1.5 right-1.5 bg-black/70 px-1.5 py-0.5 rounded-md">
              <Text className="text-white text-[10px] font-bold">
                {item.duration.toFixed(1)}s
              </Text>
            </View>
          </LinearGradient>

          {/* Content */}
          <View className="flex-1">
            <Text className="text-base font-bold text-white mb-1" numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="text-sm text-gray-300 mb-3 leading-5" numberOfLines={2}>
              {item.description}
            </Text>

            {/* Footer */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={13} color="#A78BFA" />
                <Text className="text-xs text-gray-400 ml-1">
                  {formatDate(item.createdAt)}
                </Text>
              </View>
              <LinearGradient
                colors={['#8B5CF620', '#EC489920']}
                className="flex-row items-center px-2 py-1 rounded-lg"
              >
                <Ionicons name="cut" size={11} color="#EC4899" />
                <Text className="text-[10px] font-bold text-pink-400 ml-1">
                  {item.startTime.toFixed(1)}s - {item.endTime.toFixed(1)}s
                </Text>
              </LinearGradient>
            </View>
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            onPress={(e) => handleDelete(item.id, e)}
            className="ml-2 p-2 -mt-2 -mr-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              className="w-8 h-8 rounded-full justify-center items-center"
            >
              <Ionicons name="trash" size={16} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </AnimatedTouchable>
  );

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      className="flex-1"
    >
      {/* Colorful Header */}
      <View className="pb-5 px-5" style={{ paddingTop: insets.top + 20 }}>
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-[28px] font-bold text-white mb-1">Video Diary</Text>
            <View className="flex-row items-center">
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                className="w-1.5 h-1.5 rounded-full mr-2"
              />
              <Text className="text-[15px] text-gray-300 font-medium">
                {videos?.length || 0} {videos?.length === 1 ? 'video' : 'videos'} saved
              </Text>
            </View>
          </View>
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            className="w-14 h-14 rounded-full justify-center items-center ml-4"
          >
            <Ionicons name="videocam" size={28} color="white" />
          </LinearGradient>
        </View>
      </View>

      {/* Video List */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
          >
            <ActivityIndicator size="large" color="white" />
          </LinearGradient>
          <Text className="mt-3 text-gray-300 text-sm font-medium">Loading videos...</Text>
        </View>
      ) : videos && videos.length > 0 ? (
        <FlatList
          data={videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 + insets.bottom }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor="#EC4899"
              colors={['#EC4899']}
            />
          }
        />
      ) : (
        <Animated.View
          entering={FadeIn.delay(200)}
          className="flex-1 justify-center items-center px-6"
          style={{ paddingBottom: insets.bottom + 20 }}
        >
          {/* Gradient Icon */}
          <Animated.View entering={FadeIn.delay(300).springify()} className="mb-8">
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-28 h-28 rounded-full justify-center items-center"
            >
              <Ionicons name="videocam" size={56} color="white" />
            </LinearGradient>
          </Animated.View>

          {/* Title & Description */}
          <Animated.View entering={FadeIn.delay(400)} className="items-center mb-10">
            <Text className="text-3xl font-bold text-white mb-3 text-center">
              Start Your Video Journey
            </Text>
            <Text className="text-base text-gray-300 text-center leading-6 px-4">
              Capture life's best moments in bite-sized clips
            </Text>
            <LinearGradient
              colors={['#8B5CF620', '#EC489920']}
              className="flex-row items-center mt-4 px-4 py-2 rounded-full border border-purple-400/30"
            >
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                className="w-2 h-2 rounded-full mr-2"
              />
              <Text className="text-sm font-semibold text-purple-300">
                5-second video magic ✨
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Feature Cards */}
          <Animated.View entering={FadeIn.delay(500)} className="w-full mb-10 px-2">
            <View className="flex-row gap-4">
              <Animated.View entering={FadeInDown.delay(550).springify()} className="flex-1">
                <LinearGradient
                  colors={['#1a1a2e', '#16213e']}
                  className="rounded-3xl p-5 items-center border border-blue-400/30"
                >
                  <LinearGradient
                    colors={['#3B82F6', '#8B5CF6']}
                    className="w-14 h-14 rounded-2xl justify-center items-center mb-4"
                  >
                    <Ionicons name="cut" size={24} color="white" />
                  </LinearGradient>
                  <Text className="text-base font-bold text-white mb-2 text-center">
                    Smart Crop
                  </Text>
                  <Text className="text-xs text-gray-300 text-center">
                    Precision trimming{'\n'}to 5 seconds
                  </Text>
                </LinearGradient>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(600).springify()} className="flex-1">
                <LinearGradient
                  colors={['#1a1a2e', '#16213e']}
                  className="rounded-3xl p-5 items-center border border-pink-400/30"
                >
                  <LinearGradient
                    colors={['#EC4899', '#F59E0B']}
                    className="w-14 h-14 rounded-2xl justify-center items-center mb-4"
                  >
                    <Ionicons name="folder" size={24} color="white" />
                  </LinearGradient>
                  <Text className="text-base font-bold text-white mb-2 text-center">
                    Organize
                  </Text>
                  <Text className="text-xs text-gray-300 text-center">
                    Name & tag{'\n'}your memories
                  </Text>
                </LinearGradient>
              </Animated.View>
            </View>
          </Animated.View>

          {/* CTA Button */}
          <Animated.View entering={FadeIn.delay(700).springify()} className="w-full px-4">
            <TouchableOpacity
              onPress={() => router.push('/video/create')}
              className="rounded-2xl overflow-hidden"
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="px-8 py-5"
              >
                <View className="flex-row items-center justify-center">
                  <LinearGradient
                    colors={['#ffffff40', '#ffffff20']}
                    className="w-10 h-10 rounded-full justify-center items-center mr-3"
                  >
                    <Ionicons name="add" size={24} color="white" />
                  </LinearGradient>
                  <View>
                    <Text className="text-white text-lg font-bold">
                      Create Your First Video
                    </Text>
                    <Text className="text-white/90 text-xs font-medium">
                      Tap to get started
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}

      {/* Floating Action Button */}
      {videos && videos.length > 0 && (
        <Animated.View
          entering={FadeIn.delay(300)}
          className="absolute right-6"
          style={{ bottom: 24 + insets.bottom }}
        >
          <TouchableOpacity
            onPress={() => router.push('/video/create')}
            activeOpacity={0.8}
            className="rounded-full overflow-hidden shadow-lg shadow-purple-500/50"
          >
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-16 h-16 justify-center items-center"
            >
              <Ionicons name="add" size={32} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
    </LinearGradient>
  );
}
