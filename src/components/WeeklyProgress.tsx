import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';
import { Svg, Polyline, Line, Circle, Text as SvgText } from 'react-native-svg';

interface WeeklyProgressProps {
  events: any[];
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function WeeklyProgress({ events }: WeeklyProgressProps) {
  const weeklyData = useMemo(() => {
    // Get today and the last 6 days
    const today = new Date();
    const dates = Array(7)
      .fill(0)
      .map((_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - i));
        date.setHours(0, 0, 0, 0);
        return date;
      });

    // Count events for each day
    const countsByDay = dates.map(date => {
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      return events.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= date && eventDate < nextDay;
      }).length;
    });

    return {
      dates,
      counts: countsByDay,
    };
  }, [events]);

  // Find the maximum count to scale the graph
  const maxCount = Math.max(...weeklyData.counts, 2); // Minimum scale of 2 for better visibility

  // Dimensions for the graph
  const graphWidth = 280;
  const graphHeight = 120;
  const paddingX = 30;
  const paddingY = 20;
  const chartWidth = graphWidth - (paddingX * 2);
  const chartHeight = graphHeight - (paddingY * 2);

  // Generate the polyline points
  const points = weeklyData.counts.map((count, index) => {
    const x = paddingX + (index * (chartWidth / 6));
    const y = paddingY + chartHeight - (count / maxCount) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <View style={styles.container}>
      <View style={styles.graphContainer}>
        <Svg width={graphWidth} height={graphHeight}>
          {/* Y-axis */}
          <Line 
            x1={paddingX} 
            y1={paddingY} 
            x2={paddingX} 
            y2={paddingY + chartHeight} 
            stroke={colors.gray[400]} 
            strokeWidth="1" 
          />
          
          {/* X-axis */}
          <Line 
            x1={paddingX} 
            y1={paddingY + chartHeight} 
            x2={paddingX + chartWidth} 
            y2={paddingY + chartHeight} 
            stroke={colors.gray[400]} 
            strokeWidth="1" 
          />
          
          {/* Polyline for the graph */}
          <Polyline
            points={points}
            fill="none"
            stroke={colors.primary}
            strokeWidth="2"
          />
          
          {/* Data points */}
          {weeklyData.counts.map((count, index) => {
            const x = paddingX + (index * (chartWidth / 6));
            const y = paddingY + chartHeight - (count / maxCount) * chartHeight;
            
            return (
              <Circle
                key={index}
                cx={x}
                cy={y}
                r={3}
                fill={colors.primary}
              />
            );
          })}
          
          {/* X-axis labels (days) */}
          {DAYS_OF_WEEK.map((day, index) => {
            const x = paddingX + (index * (chartWidth / 6));
            
            return (
              <SvgText
                key={index}
                x={x}
                y={paddingY + chartHeight + 15}
                fontSize="10"
                textAnchor="middle"
                fill={colors.text}
              >
                {day}
              </SvgText>
            );
          })}
          
          {/* Y-axis labels (event count markers) */}
          <SvgText
            x={paddingX - 10}
            y={paddingY + 5}
            fontSize="10"
            textAnchor="end"
            fill={colors.text}
          >
            {maxCount}
          </SvgText>
          
          <SvgText
            x={paddingX - 10}
            y={paddingY + (chartHeight / 2) + 5}
            fontSize="10"
            textAnchor="end"
            fill={colors.text}
          >
            {Math.round(maxCount / 2)}
          </SvgText>
          
          <SvgText
            x={paddingX - 10}
            y={paddingY + chartHeight + 5}
            fontSize="10"
            textAnchor="end"
            fill={colors.text}
          >
            0
          </SvgText>
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: theme.borderRadius.m,
    borderColor: colors.border,
    borderWidth: 1,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.l,
  },
  title: {
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
    color: colors.text,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  graphContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WeeklyProgress; 