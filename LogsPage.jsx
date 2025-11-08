import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';
import { format } from 'date-fns';

const LogsPage = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/logs');
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8" data-testid="logs-page">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Activity className="text-purple-500" size={32} />
          <h1 className="text-4xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
            {t('activityLogs')}
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">{t('time')}</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">{t('action')}</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">{t('details')}</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                      {t('loading')}
                    </td>
                  </tr>
                ) : (
                  logs.map((log, index) => (
                    <tr
                      key={log.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      }`}
                      data-testid={`log-row-${log.id}`}
                    >
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">{log.action}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{log.details}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogsPage;