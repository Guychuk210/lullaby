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

      console.log('Loading events for user:', auth.currentUser.uid);

      // Get all user's devices
      const devices = await getUserDevices(auth.currentUser.uid);
      console.log('Retrieved devices:', devices.length, devices.map(d => d.id));
      
      // Get events for each device
      const allEvents: BedWettingEvent[] = [];
      for (const device of devices) {
        console.log(`Fetching events for device: ${device.id}`);
        const deviceEvents = await getDeviceEvents(device.id);
        console.log(`Retrieved ${deviceEvents.length} events for device ${device.id}`);
        console.log('First few events:', deviceEvents.slice(0, 3).map(e => ({id: e.id, timestamp: e.timestamp})));
        allEvents.push(...deviceEvents);
      }

      // Sort all events by timestamp
      allEvents.sort((a, b) => b.timestamp - a.timestamp);
      console.log(`Total events loaded: ${allEvents.length}`);
      
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
    if (!auth.currentUser) {
      console.log('No authenticated user found, skipping event loading');
      return;
    }

    console.log('Setting up events and subscriptions for user:', auth.currentUser.uid);

    const setupSubscriptions = async () => {
      try {
        // First load all events
        await loadEvents();

        // Then get all user's devices for subscriptions
        const devices = await getUserDevices(auth.currentUser!.uid);
        console.log('Setting up subscriptions for devices:', devices.map(d => d.id));
        
        // Create unsubscribe functions for each device
        const unsubscribeFunctions = devices.map(device => 
          subscribeToDeviceEvents(device.id, (deviceEvents) => {
            console.log(`Real-time update received for device ${device.id}: ${deviceEvents.length} events`);
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
      console.log('Cleaning up event subscriptions');
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