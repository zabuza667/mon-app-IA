import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { Toaster } from './components/ui/sonner';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import EmailsPage from './pages/EmailsPage';
import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';
import ExcelPage from './pages/ExcelPage';
import LogsPage from './pages/LogsPage';
import '@/App.css';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden" data-testid="app-container">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/emails" element={<EmailsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/excel" element={<ExcelPage />} />
              <Route path="/logs" element={<LogsPage />} />
            </Routes>
          </main>
        </div>
        <Toaster position="top-right" />
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;