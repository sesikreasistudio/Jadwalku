/**
 * Google Calendar REST API Client & iCalendar (.ics) generator
 */
import { getAccessToken } from '../firebase';
import { ScheduleItem } from '../types';

export interface CalendarSyncResult {
  success: boolean;
  googleEventId?: string;
  error?: string;
}

export async function createGoogleCalendarEvent(item: ScheduleItem): Promise<CalendarSyncResult> {
  const token = await getAccessToken();
  if (!token) {
    return { success: false, error: 'Silakan masuk dengan akun Google terlebih dahulu.' };
  }

  try {
    const startDateTime = `${item.date}T${item.startTime}:00`;
    const endDateTime = `${item.date}T${item.endTime}:00`;

    const eventPayload = {
      summary: item.title,
      description: `${item.description ? item.description + '\n\n' : ''}[Dibuat via JadwalKu | Kategori: ${item.category}]`,
      location: item.location || '',
      start: {
        dateTime: new Date(startDateTime).toISOString(),
      },
      end: {
        dateTime: new Date(endDateTime).toISOString(),
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: item.reminderMinutes || 10 },
          { method: 'email', minutes: item.reminderMinutes || 10 },
        ],
      },
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Google API error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, googleEventId: data.id };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal menyinkronkan ke Google Kalender';
    console.error('Error creating Google Calendar event:', err);
    return { success: false, error: errorMsg };
  }
}

export async function fetchGoogleCalendarEvents(dateStr: string): Promise<ScheduleItem[]> {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const timeMin = new Date(`${dateStr}T00:00:00Z`).toISOString();
    const timeMax = new Date(`${dateStr}T23:59:59Z`).toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Google Calendar API error ${response.status}`);
    }

    const data = await response.json();
    const events: ScheduleItem[] = [];

    if (data.items && Array.isArray(data.items)) {
      for (const ev of data.items) {
        if (!ev.summary) continue;

        let startTime = '09:00';
        let endTime = '10:00';

        if (ev.start?.dateTime) {
          const d = new Date(ev.start.dateTime);
          startTime = d.toTimeString().substring(0, 5);
        }
        if (ev.end?.dateTime) {
          const d = new Date(ev.end.dateTime);
          endTime = d.toTimeString().substring(0, 5);
        }

        events.push({
          id: `gcal-${ev.id || Math.random().toString(36).substring(2, 9)}`,
          title: ev.summary,
          description: ev.description || '',
          startTime,
          endTime,
          date: dateStr,
          category: 'kerja',
          priority: 'sedang',
          location: ev.location || '',
          isCompleted: false,
          reminderMinutes: 10,
          googleEventId: ev.id,
          updatedAt: Date.now(),
          syncStatus: 'synced',
        });
      }
    }

    return events;
  } catch (e) {
    console.error('Failed to fetch events from Google Calendar:', e);
    return [];
  }
}

export async function deleteGoogleCalendarEvent(eventId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;

  try {
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.status === 204 || res.status === 404;
  } catch (e) {
    console.error('Error deleting Google Calendar event:', e);
    return false;
  }
}

/**
 * Generate a direct web URL to add an event in Google Calendar without login
 */
export function getGoogleCalendarWebUrl(item: ScheduleItem): string {
  const startISO = `${item.date.replace(/-/g, '')}T${item.startTime.replace(':', '')}00`;
  const endISO = `${item.date.replace(/-/g, '')}T${item.endTime.replace(':', '')}00`;
  const text = encodeURIComponent(item.title);
  const details = encodeURIComponent(item.description || `Jadwal: ${item.title}`);
  const location = encodeURIComponent(item.location || '');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startISO}/${endISO}&details=${details}&location=${location}`;
}

/**
 * Download standard .ICS (iCalendar) file compatible with all mobile & desktop calendars
 */
export function exportToICS(items: ScheduleItem[], filename = 'jadwal-harian.ics') {
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JadwalKu//Daily Schedule App//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const item of items) {
    const start = `${item.date.replace(/-/g, '')}T${item.startTime.replace(':', '')}00`;
    const end = `${item.date.replace(/-/g, '')}T${item.endTime.replace(':', '')}00`;
    ics.push(
      'BEGIN:VEVENT',
      `UID:${item.id}@jadwalku.app`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${item.title.replace(/\n/g, ' ')}`,
      `DESCRIPTION:${(item.description || '').replace(/\n/g, '\\n')}`,
      `LOCATION:${item.location || ''}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  }

  ics.push('END:VCALENDAR');

  const blob = new Blob([ics.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
