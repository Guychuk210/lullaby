import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';

interface VideoItem {
  id: string;
  title: string;
  duration: string;
  imageUrl?: string;
  onPress: () => void;
}

interface GuidanceVideosProps {
  videos: VideoItem[];
}

function GuidanceVideos({ videos }: GuidanceVideosProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.sectionTitle}>This is your place to start!</Text>
      
      {videos.map((video) => (
        <TouchableOpacity 
          key={video.id} 
          style={styles.videoCard}
          onPress={video.onPress}
        >
          <View style={styles.videoThumbnail}>
            {video.imageUrl ? (
              <Image 
                source={{ uri: video.imageUrl }} 
                style={styles.thumbnailImage} 
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderThumbnail}>
                <Ionicons name="videocam" size={28} color={colors.gray[400]} />
              </View>
            )}
          </View>
          
          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle}>{video.title}</Text>
            <Text style={styles.videoDuration}>{video.duration}</Text>
          </View>
          
          <TouchableOpacity style={styles.watchButton}>
            <Text style={styles.watchButtonText}>Watch</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.s,
    color: colors.text,
    opacity: 0.6,
    marginBottom: theme.spacing.l,
    alignSelf: 'center',
  },
  videoCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: colors.border,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    alignItems: 'center',
    // shadowColor: colors.black,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  videoThumbnail: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginRight: theme.spacing.m,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  videoDuration: {
    fontSize: theme.typography.fontSize.s,
    color: colors.gray[500],
  },
  watchButton: {
    backgroundColor: colors.background,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.m,
  },
  watchButtonText: {
    fontSize: theme.typography.fontSize.s,
    fontWeight: '600',
    color: colors.text,
  },
});

export default GuidanceVideos; 