import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { format } from 'date-fns';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';
import { BedWettingEvent } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface EventCardProps {
  event: BedWettingEvent;
  onDelete?: (eventId: string) => void;
}

function EventCard({ event, onDelete }: EventCardProps) {
  // Convert timestamp to Date object if it's not already one
  const eventDate = new Date(event.timestamp);
  
  return (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="calendar-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>Detection Event</Text>
          <Text style={styles.eventTime}>
            {format(eventDate, 'yyyy-MM-dd')} at {format(eventDate, 'hh:mm a')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: colors.background, // Match background color
    borderWidth: 1, // Add border
    borderColor: colors.border, // Add border color
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: theme.spacing.m,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: theme.typography.fontSize.m,
    fontWeight: '500',
    color: colors.text,
  },
  eventTime: {
    fontSize: theme.typography.fontSize.s,
    color: colors.gray[500],
    marginTop: 2,
  }
});

export default EventCard; 