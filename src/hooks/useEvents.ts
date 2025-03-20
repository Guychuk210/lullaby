import { useState, useEffect } from 'react';
import { 
  getDeviceEvents, 
  subscribeToDeviceEvents, 
  resolveEvent as resolveEventService,
  deleteEvent as deleteEventService
} from '../services/events';
import { BedWettingEvent } from '../types';
import { auth } from '../services/firebase';
import { getUserDevices } from '../services/sensor';

export function useEvents() {
  const [events, setEvents] = useState<BedWettingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unsubscribeFns, setUnsubscribeFns] = useState<(() => void)[]>([]);

  // Load events for all user's devices
  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      // Get all user's devices
      const devices = await getUserDevices(auth.currentUser.uid);
      
      // Get events for each device
      const allEvents: BedWettingEvent[] = [];
      for (const device of devices) {
        const deviceEvents = await getDeviceEvents(device.id);
        allEvents.push(...deviceEvents);
      }

      // Sort all events by timestamp
      allEvents.sort((a, b) => b.timestamp - a.timestamp);
      
      setEvents(allEvents);
    } catch (err) {
      console.error('Error loading events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and setup subscriptions
  useEffect(() => {
    if (!auth.currentUser) return;

    const setupSubscriptions = async () => {
      try {
        // First load all events
        await loadEvents();

        // Then get all user's devices for subscriptions
        const devices = await getUserDevices(auth.currentUser!.uid);
        
        // Create unsubscribe functions for each device
        const unsubscribeFunctions = devices.map(device => 
          subscribeToDeviceEvents(device.id, (deviceEvents) => {
            setEvents(currentEvents => {
              // Remove old events for this device
              const otherEvents = currentEvents.filter(e => e.deviceId !== device.id);
              // Add new events for this device
              return [...otherEvents, ...deviceEvents].sort((a, b) => b.timestamp - a.timestamp);
            });
          })
        );

        // Store the unsubscribe functions
        setUnsubscribeFns(unsubscribeFunctions);
      } catch (err) {
        console.error('Error setting up event subscriptions:', err);
      }
    };

    setupSubscriptions();

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeFns.forEach(fn => fn());
    };
  }, [auth.currentUser]);

  // Resolve an event
  const resolveEvent = async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');
      await resolveEventService(eventId, event.deviceId);
      // The real-time subscription will update the events automatically
    } catch (err) {
      console.error('Error resolving event:', err);
      throw err;
    }
  };

  // Delete an event
  const deleteEvent = async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');
      await deleteEventService(eventId, event.deviceId);
      // The real-time subscription will update the events automatically
    } catch (err) {
      console.error('Error deleting event:', err);
      throw err;
    }
  };

  return {
    events,
    isLoading,
    error,
    resolveEvent,
    deleteEvent
  };
} 