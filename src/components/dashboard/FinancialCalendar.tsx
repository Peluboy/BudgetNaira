import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface Event {
  _id: string;
  title: string;
  description?: string;
  amount?: number;
  start: Date;
  end: Date;
  type: string;
}

const FinancialCalendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/v1/financial-events', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      // Convert events to calendar format
      const formattedEvents = data.data.map((event: any) => ({
        ...event,
        start: new Date(event.date),
        end: new Date(event.date)
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  return (
    <div style={{ height: '600px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={['month', 'week', 'day']}
        eventPropGetter={(event) => ({
          className: `event-${event.type}`
        })}
      />
    </div>
  );
};

export default FinancialCalendar; 