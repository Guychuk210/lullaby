import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';
import { SensorData } from '../types';

interface EventCalendarProps {
  sensorData: SensorData[];
  onDayPress?: (date: Date) => void;
}

function EventCalendar({ sensorData, onDayPress }: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [eventDays, setEventDays] = useState<number[]>([]);
  
  // Process sensor data to find days with events
  useEffect(() => {
    if (!sensorData.length) return;
    
    // Get all days in the current month where a wet event occurred
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const daysWithEvents = sensorData
      .filter(data => {
        const eventDate = new Date(data.timestamp);
        return data.isWet && 
               eventDate.getFullYear() === year && 
               eventDate.getMonth() === month;
      })
      .map(data => new Date(data.timestamp).getDate())
      // Remove duplicates
      .filter((day, index, self) => self.indexOf(day) === index);
    
    setEventDays(daysWithEvents);
  }, [sensorData, currentMonth]);
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    setCurrentMonth(previousMonth);
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };
  
  // Get days for the calendar grid
  const getDaysArray = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Get the total number of days in the month
    const daysInMonth = lastDay.getDate();
    
    // Get the last day of the previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    // Days from previous month to display
    const prevMonthDays = Array.from({ length: firstDayOfWeek }, (_, i) => ({
      day: prevMonthLastDay - firstDayOfWeek + i + 1,
      isCurrentMonth: false,
      isPrevMonth: true,
    }));
    
    // Days from current month
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      isCurrentMonth: true,
      isEvent: eventDays.includes(i + 1),
    }));
    
    // Calculate how many days from next month we need to display
    const totalDaysDisplayed = 42; // 6 rows of 7 days
    const nextMonthDays = Array.from(
      { length: totalDaysDisplayed - prevMonthDays.length - currentMonthDays.length },
      (_, i) => ({
        day: i + 1,
        isCurrentMonth: false,
        isNextMonth: true,
      })
    );
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };
  
  // Format month name
  const getMonthName = () => {
    return currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  
  // Render calendar
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const calendarDays = getDaysArray();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event Calendar</Text>
      
      <View style={styles.calendarContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color={colors.gray[500]} />
          </TouchableOpacity>
          
          <Text style={styles.monthTitle}>{getMonthName()}</Text>
          
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color={colors.gray[500]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.weekdaysRow}>
          {daysOfWeek.map((day) => (
            <Text key={day} style={styles.weekdayText}>{day}</Text>
          ))}
        </View>
        
        <View style={styles.daysGrid}>
          {calendarDays.map((dayInfo, index) => (
            <TouchableOpacity
              key={`${dayInfo.day}-${index}`}
              style={[
                styles.dayCell,
                !dayInfo.isCurrentMonth && styles.otherMonthDay,
                dayInfo.isEvent && styles.eventDay,
              ]}
              onPress={() => {
                if (dayInfo.isCurrentMonth && onDayPress) {
                  const selectedDate = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    dayInfo.day
                  );
                  onDayPress(selectedDate);
                }
              }}
              disabled={!dayInfo.isCurrentMonth}
            >
              <Text
                style={[
                  styles.dayText,
                  !dayInfo.isCurrentMonth && styles.otherMonthDayText,
                  dayInfo.isEvent && styles.eventDayText,
                ]}
              >
                {dayInfo.day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.legendContainer}>
        <Ionicons name="ellipse" size={12} color={colors.primary} />
        <Text style={styles.legendText}>Event days</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.m,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
    color: colors.text,
    marginBottom: theme.spacing.m,
  },
  calendarContainer: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: theme.borderRadius.m,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  navButton: {
    padding: theme.spacing.xs,
  },
  monthTitle: {
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
    color: colors.text,
  },
  weekdaysRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    paddingVertical: theme.spacing.s,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.typography.fontSize.s,
    color: colors.text,
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: theme.typography.fontSize.s,
    color: colors.text,
  },
  otherMonthDay: {
    opacity: 0.5,
  },
  otherMonthDayText: {
    color: colors.gray[400],
  },
  eventDay: {
    backgroundColor: colors.primary,
  },
  eventDayText: {
    color: colors.white,
    fontWeight: '600',
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.m,
  },
  legendText: {
    fontSize: theme.typography.fontSize.s,
    color: colors.gray[500],
    marginLeft: theme.spacing.xs,
  },
});

export default EventCalendar; 