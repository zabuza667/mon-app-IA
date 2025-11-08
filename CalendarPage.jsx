import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Plus, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Calendar } from '../components/ui/calendar';
import api from '../utils/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

const CalendarPage = () => {
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    reminder: 30,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/calendar');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.start_time || !newEvent.end_time) {
      toast.error(t('error'), { description: 'All fields are required' });
      return;
    }

    try {
      await api.post('/calendar', newEvent);
      toast.success(t('success'), { description: 'Event created' });
      setShowCreate(false);
      setNewEvent({ title: '', description: '', start_time: '', end_time: '', reminder: 30 });
      await fetchEvents();
    } catch (error) {
      toast.error(t('error'), { description: 'Failed to create event' });
    }
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8" data-testid="calendar-page">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <CalendarIcon className="text-purple-500" size={32} />
            <h1 className="text-4xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              {t('calendarView')}
            </h1>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            data-testid="create-event-btn"
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            <Plus size={18} className="mr-2" />
            {t('newEvent')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              data-testid="calendar-widget"
            />
          </div>

          {/* Events for Selected Date */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100" data-testid="events-list">
            <h2 className="text-xl font-bold text-slate-800 mb-4" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              {format(selectedDate, 'MMMM d, yyyy')}
            </h2>
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-500">No events for this date</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-purple-50 rounded-xl p-4 border-l-4 border-purple-500"
                    data-testid={`event-card-${event.id}`}
                  >
                    <h3 className="font-bold text-slate-800 mb-2">{event.title}</h3>
                    <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                      </div>
                      {event.reminder && (
                        <div className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                          Reminder: {event.reminder}min before
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* All Upcoming Events */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
            {t('upcomingEvents')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.slice(0, 6).map((event) => (
              <div
                key={event.id}
                className="bg-slate-50 rounded-xl p-4 hover:shadow-md transition-all"
                data-testid={`upcoming-event-${event.id}`}
              >
                <h3 className="font-bold text-slate-800 mb-1">{event.title}</h3>
                <p className="text-xs text-slate-600 mb-2">{format(new Date(event.start_time), 'MMM d, yyyy HH:mm')}</p>
                <p className="text-sm text-slate-600">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl" data-testid="create-event-dialog">
          <DialogHeader>
            <DialogTitle>{t('newEvent')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('eventTitle')}</Label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Enter event title"
                data-testid="event-title-input"
              />
            </div>
            <div>
              <Label>{t('eventDescription')}</Label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                rows={3}
                placeholder="Enter event description"
                data-testid="event-description-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('startTime')}</Label>
                <Input
                  type="datetime-local"
                  value={newEvent.start_time}
                  onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                  data-testid="event-start-time-input"
                />
              </div>
              <div>
                <Label>{t('endTime')}</Label>
                <Input
                  type="datetime-local"
                  value={newEvent.end_time}
                  onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                  data-testid="event-end-time-input"
                />
              </div>
            </div>
            <div>
              <Label>{t('reminder')}</Label>
              <Input
                type="number"
                value={newEvent.reminder}
                onChange={(e) => setNewEvent({ ...newEvent, reminder: parseInt(e.target.value) })}
                placeholder="30"
                data-testid="event-reminder-input"
              />
            </div>
            <Button onClick={handleCreateEvent} className="w-full" data-testid="submit-event-btn">
              {t('createEvent')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;