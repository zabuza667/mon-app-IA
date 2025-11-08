import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Mail, CheckSquare, Calendar, FileSpreadsheet, Activity, Settings, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';

const Sidebar = () => {
  const location = useLocation();
  const { language, toggleLanguage, t } = useLanguage();

  const menuItems = [
    { path: '/', icon: Home, label: t('home'), testId: 'nav-home' },
    { path: '/emails', icon: Mail, label: t('emails'), testId: 'nav-emails' },
    { path: '/tasks', icon: CheckSquare, label: t('tasks'), testId: 'nav-tasks' },
    { path: '/calendar', icon: Calendar, label: t('calendar'), testId: 'nav-calendar' },
    { path: '/excel', icon: FileSpreadsheet, label: t('excel'), testId: 'nav-excel' },
    { path: '/logs', icon: Activity, label: t('logs'), testId: 'nav-logs' },
  ];

  return (
    <div className="h-screen w-64 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk, sans-serif'}}>AI Assistant</h1>
        <p className="text-sm text-slate-600 mt-1">{t('dashboard')}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={item.testId}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-700 hover:bg-white hover:shadow-md'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium" style={{fontFamily: 'Inter, sans-serif'}}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <Button
          onClick={toggleLanguage}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          data-testid="language-toggle-btn"
        >
          <Globe size={18} />
          <span>{language === 'en' ? 'Français' : 'English'}</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;