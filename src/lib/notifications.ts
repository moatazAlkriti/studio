
'use server'; // Although running client-side, mark as server context potentially for future use

import type { Notification } from '@/components/layout/header'; // Import Notification type

const MAX_NOTIFICATIONS = 50; // Limit the number of stored notifications

/**
 * Adds a notification to localStorage.
 * @param message - The notification message content.
 * @param recipient - Who should see the notification ('admin', 'all', or a specific user ID).
 */
export async function addNotification(message: string, recipient: Notification['recipient']): Promise<void> { // Made function async
  if (typeof window === 'undefined') {
    console.warn('Attempted to add notification outside of browser environment.');
    return; // Cannot access localStorage on server
  }

  try {
    const newNotification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      message: message,
      timestamp: new Date().toISOString(),
      read: false,
      recipient: recipient,
    };

    const existingNotificationsJSON = localStorage.getItem('researchHubNotifications');
    let existingNotifications: Notification[] = [];

    if (existingNotificationsJSON) {
        try {
            const parsed = JSON.parse(existingNotificationsJSON);
            if (Array.isArray(parsed)) {
                existingNotifications = parsed;
            } else {
                console.warn('Invalid notification data in localStorage, resetting.');
            }
        } catch (parseError) {
            console.error('Error parsing notifications from localStorage, resetting.', parseError);
        }
    }


    // Add to the beginning and limit size
    const updatedNotifications = [newNotification, ...existingNotifications].slice(0, MAX_NOTIFICATIONS);

    localStorage.setItem('researchHubNotifications', JSON.stringify(updatedNotifications));

    // Dispatch a custom event to notify the header (or other components) to update its state immediately
    window.dispatchEvent(new CustomEvent('new-notification'));

  } catch (error) {
    console.error("Error adding notification to localStorage:", error);
    // Optionally, show an error toast to the user if this operation is critical
  }
}
