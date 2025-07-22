// components/CollapsibleControlCard.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CollapsibleControlCardProps {
  isRecording: boolean;
  onStartStop: () => void;
  onGenerateRoute: () => void;
  distance: number; // in meters
  duration: number; // in seconds
}

const METERS_PER_STEP = 0.762; // Average step length

// Helper to format duration from seconds to HH:MM:SS
const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
        .map(v => v < 10 ? "0" + v : v)
        .join(":");
}

const CollapsibleControlCard = ({ isRecording, onStartStop, onGenerateRoute, distance, duration }: CollapsibleControlCardProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const stepsTaken = Math.floor(distance / METERS_PER_STEP);

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.header} onPress={() => setIsCollapsed(!isCollapsed)}>
        <Text style={styles.headerText}>Activity Controls</Text>
        <Ionicons name={isCollapsed ? 'chevron-down' : 'chevron-up'} size={24} color="white" />
      </TouchableOpacity>

      {!isCollapsed && (
        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>{formatDuration(duration)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Steps Taken</Text>
              <Text style={styles.statValue}>{stepsTaken.toLocaleString()}</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.button, styles.generateButton]}
            onPress={onGenerateRoute}
            disabled={isRecording}
          >
            <Text style={styles.buttonText}>Generate 10k Step Route</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isRecording ? styles.stopButton : styles.startButton]}
            onPress={onStartStop}
          >
            <Text style={styles.buttonText}>{isRecording ? 'Stop Recording' : 'Start Recording'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(28, 28, 30, 0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    borderTopColor: 'rgba(255,255,255,0.15)',
    borderTopWidth: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#AEAEB2',
    fontSize: 14,
    fontWeight: '600',
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  generateButton: {
    backgroundColor: '#0A84FF',
  },
  startButton: {
    backgroundColor: '#30D158',
  },
  stopButton: {
    backgroundColor: '#FF453A',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CollapsibleControlCard;