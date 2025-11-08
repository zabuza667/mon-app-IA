import React, { useEffect, useState } from 'react';
import { Mail, Calendar, FileSpreadsheet, CheckSquare, Plus, Search, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import ActivityLogPanel from '../components/ActivityLogPanel';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { format } from 'date-fns';

const Dashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    unreadEmails: 0,
    todayEvents: 0,
    pendingTasks: 0,
    excelFiles: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [emailsRes, eventsRes, tasksRes, excelRes] = await Promise.all([
        api.get('/emails'),
        api.get('/calendar'),
        api.get('/tasks'),
        api.get('/excel'),
      ]);

      setStats({
        unreadEmails: emailsRes.data.filter(e => e.status === 'unread').length,
        todayEvents: eventsRes.data.filter(e => {
          const eventDate = new Date(e.start_time);
          const today = new Date();
          return eventDate.toDateString() === today.toDateString();
        }).length,
        pendingTasks: tasksRes.data.filter(t => t.status === 'todo').length,
        excelFiles: excelRes.data.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const quickActions = [
    { icon: Plus, label: t('newMessage'), color: 'bg-blue-500', onClick: () => navigate('/emails'), testId: 'quick-action-new-message' },
    { icon: FileSpreadsheet, label: t('newTable'), color: 'bg-green-500', onClick: () => navigate('/excel'), testId: 'quick-action-new-table' },
    { icon: Clock, label: t('schedule'), color: 'bg-purple-500', onClick: () => navigate('/calendar'), testId: 'quick-action-schedule' },
    { icon: Search, label: t('search'), color: 'bg-orange-500', onClick: () => {}, testId: 'quick-action-search' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
            {t('dashboard')}
          </h1>
          <p className="text-slate-600" style={{fontFamily: 'Inter, sans-serif'}}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => navigate('/emails')}
            data-testid="stat-card-emails"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1" style={{fontFamily: 'Inter, sans-serif'}}>{t('unreadEmails')}</p>
                <p className="text-3xl font-bold text-slate-800">{stats.unreadEmails}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl">
                <Mail className="text-blue-500" size={28} />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => navigate('/calendar')}
            data-testid="stat-card-events"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1" style={{fontFamily: 'Inter, sans-serif'}}>{t('upcomingEvents')}</p>
                <p className="text-3xl font-bold text-slate-800">{stats.todayEvents}</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-xl">
                <Calendar className="text-purple-500" size={28} />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => navigate('/tasks')}
            data-testid="stat-card-tasks"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1" style={{fontFamily: 'Inter, sans-serif'}}>{t('todo')}</p>
                <p className="text-3xl font-bold text-slate-800">{stats.pendingTasks}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-xl">
                <CheckSquare className="text-green-500" size={28} />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => navigate('/excel')}
            data-testid="stat-card-excel"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1" style={{fontFamily: 'Inter, sans-serif'}}>{t('excelFiles')}</p>
                <p className="text-3xl font-bold text-slate-800">{stats.excelFiles}</p>
              </div>
              <div className="bg-orange-100 p-4 rounded-xl">
                <FileSpreadsheet className="text-orange-500" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
            {t('quickActions')}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  onClick={action.onClick}
                  data-testid={action.testId}
                  className={`${action.color} hover:opacity-90 text-white h-24 rounded-xl shadow-lg transition-all hover:scale-105 flex flex-col items-center justify-center gap-2`}
                >
                  <Icon size={24} />
                  <span className="font-medium" style={{fontFamily: 'Inter, sans-serif'}}>{action.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Activity Log */}
        <ActivityLogPanel />
      </div>
    </div>
  );
};

export default Dashboard;