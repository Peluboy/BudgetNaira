import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FaPlus } from '@react-icons/all-files/fa/FaPlus';
import { FaCalendarAlt } from '@react-icons/all-files/fa/FaCalendarAlt';
import { FaList } from '@react-icons/all-files/fa/FaList';
import EventForm from './EventForm';
import api from '../../services/api';

const localizer = momentLocalizer(moment);

interface Event {
  _id: string;
  title: string;
  description?: string;
  amount?: number;
  start: Date;
  end: Date;
  type: 'bill' | 'payment' | 'payday' | 'goal_review' | 'tax' | 'custom';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  reminderDays: number;
  isCompleted: boolean;
  category?: string;
}

const FinancialCalendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [showListView, setShowListView] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/financial-events');
      const formattedEvents = response.data.data.map((event: any) => ({
        ...event,
        start: new Date(event.date),
        end: new Date(event.date),
        date: event.date
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setShowEventForm(true);
  };

  const handleEventSubmit = async (eventData: any) => {
    try {
      if (selectedEvent) {
        await api.put(`/financial-events/${selectedEvent._id}`, {
          ...eventData,
          date: selectedDate || eventData.date
        });
      } else {
        await api.post('/financial-events', {
          ...eventData,
          date: selectedDate || eventData.date
        });
      }
      
      await fetchEvents();
      setShowEventForm(false);
      setSelectedEvent(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const getEventStyle = (event: Event) => {
    const colors = {
      bill: '#ef4444', // red
      payment: '#22c55e', // green
      payday: '#3b82f6', // blue
      goal_review: '#f59e0b', // amber
      tax: '#8b5cf6', // purple
      custom: '#6b7280' // gray
    };

    return {
      style: {
        backgroundColor: colors[event.type],
        borderRadius: '4px',
        opacity: event.isCompleted ? 0.5 : 1,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const renderListView = () => {
    const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
    
    return (
      <div className="space-y-4">
        {sortedEvents.map((event) => (
          <div 
            key={event._id}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            onClick={() => handleSelectEvent(event)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{event.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {moment(event.start).format('MMMM D, YYYY')}
                </p>
                {event.description && (
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{event.description}</p>
                )}
              </div>
              <div className="text-right">
                {event.amount && (
                  <p className="font-medium">₦{event.amount.toLocaleString()}</p>
                )}
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                  event.isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {event.isCompleted ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setShowEventForm(true)}
            className="btn btn-primary flex items-center"
          >
            <FaPlus className="mr-2" /> Add Event
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowListView(false)}
            className={`btn ${!showListView ? 'btn-primary' : 'btn-secondary'} flex items-center`}
          >
            <FaCalendarAlt className="mr-2" /> Calendar
          </button>
          <button
            onClick={() => setShowListView(true)}
            className={`btn ${showListView ? 'btn-primary' : 'btn-secondary'} flex items-center`}
          >
            <FaList className="mr-2" /> List
          </button>
        </div>
      </div>

      {showListView ? (
        renderListView()
      ) : (
        <div style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={['month', 'week', 'day', 'agenda']}
            view={currentView}
            onView={(view) => setCurrentView(view)}
            eventPropGetter={getEventStyle}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            popup
            defaultView={Views.MONTH}
            components={{
              toolbar: (props) => (
                <div className="flex justify-between items-center mb-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => props.onNavigate('PREV')}
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => props.onNavigate('NEXT')}
                      className="btn btn-secondary"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => props.onNavigate('TODAY')}
                      className="btn btn-secondary"
                    >
                      Today
                    </button>
                  </div>
                  <div className="text-lg font-medium">
                    {props.label}
                  </div>
                  <div className="flex space-x-2">
                    {['month', 'week', 'day', 'agenda'].map((view) => (
                      <button
                        key={view}
                        onClick={() => props.onView(view as View)}
                        className={`btn ${props.view === view ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        {view.charAt(0).toUpperCase() + view.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )
            }}
          />
        </div>
      )}

      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {selectedEvent ? 'Edit Event' : 'Add New Event'}
            </h2>
            <EventForm
              onSubmit={handleEventSubmit}
              initialData={selectedEvent}
              selectedDate={selectedDate}
              onCancel={() => {
                setShowEventForm(false);
                setSelectedEvent(null);
                setSelectedDate(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialCalendar; 