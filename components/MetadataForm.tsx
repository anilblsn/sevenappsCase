import { VideoMetadataFormData, videoMetadataSchema } from '@/lib/validation';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ZodError } from 'zod';

cssInterop(LinearGradient, {
  className: 'style',
});

interface MetadataFormProps {
  onSubmit: (data: VideoMetadataFormData) => void;
  initialData?: Partial<VideoMetadataFormData>;
  isLoading?: boolean;
  submitButtonText?: string;
}

export const MetadataForm: React.FC<MetadataFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
  submitButtonText = 'Crop & Save Video',
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [errors, setErrors] = useState<Partial<Record<keyof VideoMetadataFormData, string>>>({});
  const [focused, setFocused] = useState<{ name: boolean; description: boolean }>({
    name: false,
    description: false,
  });

  const handleSubmit = () => {
    try {
      const data = videoMetadataSchema.parse({ name, description });
      setErrors({});
      onSubmit(data);
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Partial<Record<keyof VideoMetadataFormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof VideoMetadataFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  const isFormValid = name.trim().length > 0 && description.trim().length > 0;

  return (
    <Animated.View entering={FadeIn.duration(300)} className="w-full">
      <Animated.View entering={FadeInDown.delay(100).springify()} className="mb-5">
        <Text className="text-sm font-medium text-white mb-2">
          Video Name
        </Text>

        <View
          className={`border rounded-xl px-4 py-3 ${
            focused.name
              ? 'bg-zinc-800 border-blue-500'
              : errors.name
                ? 'bg-zinc-900 border-red-500'
                : 'bg-zinc-900 border-white/10'
          }`}
        >
          <TextInput
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) {
                setErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
            onFocus={() => setFocused((prev) => ({ ...prev, name: true }))}
            onBlur={() => setFocused((prev) => ({ ...prev, name: false }))}
            placeholder="e.g., Birthday celebration, Beach sunset..."
            placeholderTextColor="#52525B"
            className="text-base text-white p-0"
            editable={!isLoading}
            maxLength={100}
          />
        </View>

        {errors.name && (
          <View className="flex-row items-center mt-2">
            <Ionicons name="alert-circle" size={14} color="#EF4444" />
            <Text className="text-red-400 text-xs ml-1.5">{errors.name}</Text>
          </View>
        )}

        <View className="flex-row justify-between items-center mt-1.5">
          <Text className="text-[10px] text-gray-500">
            {name.length > 0 ? '✓ Added' : 'Required'}
          </Text>
          <Text className={`text-[10px] font-medium ${name.length >= 90 ? 'text-amber-400' : 'text-gray-500'}`}>
            {name.length}/100
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-6">
        <Text className="text-sm font-medium text-white mb-2">
          Description
        </Text>

        <View
          className={`border rounded-xl px-4 py-3 min-h-[100px] ${
            focused.description
              ? 'bg-zinc-800 border-blue-500'
              : errors.description
                ? 'bg-zinc-900 border-red-500'
                : 'bg-zinc-900 border-white/10'
          }`}
        >
          <TextInput
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (errors.description) {
                setErrors((prev) => ({ ...prev, description: undefined }));
              }
            }}
            onFocus={() => setFocused((prev) => ({ ...prev, description: true }))}
            onBlur={() => setFocused((prev) => ({ ...prev, description: false }))}
            placeholder="What makes this clip special?"
            placeholderTextColor="#52525B"
            multiline
            numberOfLines={4}
            className="text-base text-white p-0 min-h-[80px]"
            style={{ textAlignVertical: 'top' }}
            editable={!isLoading}
            maxLength={500}
          />
        </View>

        {errors.description && (
          <View className="flex-row items-center mt-2">
            <Ionicons name="alert-circle" size={14} color="#EF4444" />
            <Text className="text-red-400 text-xs ml-1.5">{errors.description}</Text>
          </View>
        )}

        <View className="flex-row justify-between items-center mt-1.5">
          <Text className="text-[10px] text-gray-500">
            {description.length > 0 ? '✓ Added' : 'Required'}
          </Text>
          <Text className={`text-[10px] font-medium ${description.length >= 450 ? 'text-amber-400' : 'text-gray-500'}`}>
            {description.length}/500
          </Text>
        </View>
      </Animated.View>

      {/* Gradient Submit Button */}
      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading || !isFormValid}
          className={`rounded-2xl overflow-hidden ${isLoading || !isFormValid ? 'opacity-50' : 'opacity-100'}`}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isFormValid ? ['#8B5CF6', '#EC4899'] : ['#27272a', '#3f3f46']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-4"
          >
            <View className="items-center flex-row justify-center">
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-semibold text-base ml-3">
                    Processing...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={22} color="white" />
                  <Text className="text-white font-semibold text-base ml-2">
                    {submitButtonText}
                  </Text>
                </>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {!isFormValid && (
          <View className="mt-3 flex-row items-center justify-center">
            <Ionicons name="information-circle-outline" size={14} color="#71717a" />
            <Text className="text-xs text-gray-400 ml-1.5">
              Fill in both fields to continue
            </Text>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
};
