import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';
import { format } from 'date-fns';

const ActivityLogPanel = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/logs');
      setLogs(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100" data-testid="activity-log-panel">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="text-purple-500" size={24} />
        <h2 className="text-xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
          {t('recentActivity')}
        </h2>
      </div>

      <div className="space-y-3">
        {logs.length === 0 ? (
          <p className="text-slate-500 text-center py-4">{t('loading')}</p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              data-testid={`activity-log-item-${log.id}`}
            >
              <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(log.status)}`}>
                {log.status}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800 text-sm">{log.action}</p>
                <p className="text-xs text-slate-600 mt-1">{log.details}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {format(new Date(log.timestamp), 'HH:mm:ss')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLogPanel;