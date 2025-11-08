import React, { useEffect, useState } from 'react';
import { Mail, Send, Archive, Eye, Settings, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import api from '../utils/api';
import { toast } from 'sonner';

const EmailsPage = () => {
  const { t } = useLanguage();
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [editedResponse, setEditedResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    imap_server: '',
    imap_port: 993,
    smtp_server: '',
    smtp_port: 465,
    email: '',
    password: '',
  });

  useEffect(() => {
    fetchEmails();
    fetchConfig();
  }, []);

  const fetchEmails = async () => {
    try {
      const response = await api.get('/emails');
      setEmails(response.data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await api.get('/email-config');
      if (response.data) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const handleFetchEmails = async () => {
    setLoading(true);
    try {
      await api.post('/emails/fetch');
      await fetchEmails();
      toast.success(t('success'), { description: 'Emails fetched and analyzed' });
    } catch (error) {
      toast.error(t('error'), { description: error.response?.data?.detail || 'Failed to fetch emails' });
    }
    setLoading(false);
  };

  const handleSaveConfig = async () => {
    try {
      await api.post('/email-config', config);
      toast.success(t('success'), { description: 'Email configuration saved' });
      setShowConfig(false);
    } catch (error) {
      toast.error(t('error'), { description: 'Failed to save configuration' });
    }
  };

  const handleSendResponse = async () => {
    if (!selectedEmail || !editedResponse.trim()) return;

    try {
      await api.post('/emails/send', {
        email_id: selectedEmail.id,
        response_text: editedResponse,
      });
      toast.success(t('success'), { description: 'Email response sent' });
      setSelectedEmail(null);
      await fetchEmails();
    } catch (error) {
      toast.error(t('error'), { description: error.response?.data?.detail || 'Failed to send email' });
    }
  };

  const handleEmailAction = async (emailId, action) => {
    try {
      await api.post('/emails/action', { email_id: emailId, action });
      toast.success(t('success'), { description: `Email ${action}d` });
      await fetchEmails();
    } catch (error) {
      toast.error(t('error'), { description: 'Action failed' });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8" data-testid="emails-page">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Mail className="text-blue-500" size={32} />
            <h1 className="text-4xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              {t('emailInbox')}
            </h1>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowConfig(true)}
              variant="outline"
              data-testid="email-config-btn"
            >
              <Settings size={18} className="mr-2" />
              {t('emailConfig')}
            </Button>
            <Button
              onClick={handleFetchEmails}
              disabled={loading}
              data-testid="fetch-emails-btn"
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <RefreshCw size={18} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              {t('fetchEmails')}
            </Button>
          </div>
        </div>

        {/* Email List */}
        <div className="grid gap-4">
          {emails.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
              <Mail className="mx-auto text-slate-300 mb-4" size={64} />
              <p className="text-slate-500 text-lg">No emails yet. Configure your email and fetch emails.</p>
            </div>
          ) : (
            emails.map((email) => (
              <div
                key={email.id}
                className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all"
                data-testid={`email-item-${email.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(email.priority)}`}>
                        {email.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        email.status === 'unread' ? 'bg-blue-100 text-blue-700' :
                        email.status === 'responded' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {email.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{email.subject}</h3>
                    <p className="text-sm text-slate-600"><strong>{t('from')}:</strong> {email.from_email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEmailAction(email.id, 'mark_read')}
                      data-testid={`mark-read-btn-${email.id}`}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEmailAction(email.id, 'archive')}
                      data-testid={`archive-btn-${email.id}`}
                    >
                      <Archive size={16} />
                    </Button>
                  </div>
                </div>

                {email.summary && (
                  <div className="bg-blue-50 rounded-xl p-4 mb-3">
                    <p className="text-sm font-medium text-slate-700 mb-2">{t('summary')}:</p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{email.summary}</p>
                  </div>
                )}

                {email.draft_response && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">{t('draftResponse')}:</p>
                    <p className="text-sm text-slate-600 mb-3 whitespace-pre-wrap">{email.draft_response}</p>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedEmail(email);
                        setEditedResponse(email.draft_response);
                      }}
                      data-testid={`edit-response-btn-${email.id}`}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Send size={16} className="mr-2" />
                      {t('sendResponse')}
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Response Dialog */}
      {selectedEmail && (
        <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
          <DialogContent className="max-w-2xl" data-testid="edit-response-dialog">
            <DialogHeader>
              <DialogTitle>{t('edit')} {t('draftResponse')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Response to: {selectedEmail.subject}</Label>
                <Textarea
                  value={editedResponse}
                  onChange={(e) => setEditedResponse(e.target.value)}
                  rows={10}
                  className="mt-2"
                  data-testid="response-textarea"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedEmail(null)} data-testid="cancel-response-btn">
                  {t('cancel')}
                </Button>
                <Button onClick={handleSendResponse} data-testid="send-response-btn" className="bg-green-500 hover:bg-green-600 text-white">
                  <Send size={16} className="mr-2" />
                  {t('sendResponse')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Email Config Dialog */}
      <Dialog open={showConfig} onOpenChange={setShowConfig}>
        <DialogContent className="max-w-2xl" data-testid="email-config-dialog">
          <DialogHeader>
            <DialogTitle>{t('emailConfig')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('imapServer')}</Label>
                <Input
                  value={config.imap_server}
                  onChange={(e) => setConfig({ ...config, imap_server: e.target.value })}
                  placeholder="imap.gmail.com"
                  data-testid="imap-server-input"
                />
              </div>
              <div>
                <Label>{t('imapPort')}</Label>
                <Input
                  type="number"
                  value={config.imap_port}
                  onChange={(e) => setConfig({ ...config, imap_port: parseInt(e.target.value) })}
                  data-testid="imap-port-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('smtpServer')}</Label>
                <Input
                  value={config.smtp_server}
                  onChange={(e) => setConfig({ ...config, smtp_server: e.target.value })}
                  placeholder="smtp.gmail.com"
                  data-testid="smtp-server-input"
                />
              </div>
              <div>
                <Label>{t('smtpPort')}</Label>
                <Input
                  type="number"
                  value={config.smtp_port}
                  onChange={(e) => setConfig({ ...config, smtp_port: parseInt(e.target.value) })}
                  data-testid="smtp-port-input"
                />
              </div>
            </div>
            <div>
              <Label>{t('email')}</Label>
              <Input
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                placeholder="your-email@example.com"
                data-testid="email-input"
              />
            </div>
            <div>
              <Label>{t('password')}</Label>
              <Input
                type="password"
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                placeholder="App password or regular password"
                data-testid="password-input"
              />
            </div>
            <Button onClick={handleSaveConfig} className="w-full" data-testid="save-config-btn">
              {t('saveConfig')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailsPage;