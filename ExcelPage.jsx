import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, Download, Plus, BarChart3 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import api from '../utils/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ExcelPage = () => {
  const { t } = useLanguage();
  const [files, setFiles] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newFile, setNewFile] = useState({
    request_text: '',
    data: '',
  });

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await api.get('/excel');
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleCreateFile = async () => {
    if (!newFile.request_text.trim()) {
      toast.error(t('error'), { description: 'Request description is required' });
      return;
    }

    let parsedData = null;
    if (newFile.data.trim()) {
      try {
        parsedData = JSON.parse(newFile.data);
      } catch (e) {
        toast.error(t('error'), { description: 'Invalid JSON data format' });
        return;
      }
    }

    try {
      await api.post('/excel/create', {
        request_text: newFile.request_text,
        data: parsedData,
      });
      toast.success(t('success'), { description: 'File created successfully' });
      setShowCreate(false);
      setNewFile({ request_text: '', data: '' });
      await fetchFiles();
    } catch (error) {
      toast.error(t('error'), { description: error.response?.data?.detail || 'Failed to create file' });
    }
  };

  const handleDownload = async (fileId) => {
    try {
      const response = await api.get(`/excel/download/${fileId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `file_${fileId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error(t('error'), { description: 'Failed to download file' });
    }
  };

  const sampleData = [
    { "Month": "January", "Sales": 12000, "Expenses": 8000 },
    { "Month": "February", "Sales": 15000, "Expenses": 9000 },
    { "Month": "March", "Sales": 18000, "Expenses": 10000 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8" data-testid="excel-page">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="text-green-500" size={32} />
            <h1 className="text-4xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              {t('dataManagement')}
            </h1>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            data-testid="create-file-btn"
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Plus size={18} className="mr-2" />
            {t('createNewFile')}
          </Button>
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-12 text-center shadow-lg">
              <FileSpreadsheet className="mx-auto text-slate-300 mb-4" size={64} />
              <p className="text-slate-500 text-lg">No files yet. Create your first Excel file or chart.</p>
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all"
                data-testid={`file-card-${file.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  {file.file_type === 'chart' ? (
                    <BarChart3 className="text-green-500" size={32} />
                  ) : (
                    <FileSpreadsheet className="text-green-500" size={32} />
                  )}
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    {file.file_type}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 mb-2 line-clamp-2">{file.name}</h3>
                <p className="text-xs text-slate-500 mb-3">
                  {format(new Date(file.created_at), 'MMM d, yyyy HH:mm')}
                </p>
                {file.preview_data && (
                  <div className="bg-slate-50 rounded-lg p-3 mb-3 text-xs text-slate-600">
                    <p>Rows: {file.preview_data.rows}</p>
                    <p>Columns: {file.preview_data.columns}</p>
                  </div>
                )}
                <Button
                  size="sm"
                  onClick={() => handleDownload(file.id)}
                  data-testid={`download-btn-${file.id}`}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  <Download size={16} className="mr-2" />
                  {t('download')}
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create File Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl" data-testid="create-file-dialog">
          <DialogHeader>
            <DialogTitle>{t('createNewFile')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('requestDescription')}</Label>
              <Input
                value={newFile.request_text}
                onChange={(e) => setNewFile({ ...newFile, request_text: e.target.value })}
                placeholder="E.g., 'Create a sales report' or 'Generate expense pie chart'"
                data-testid="file-request-input"
              />
            </div>
            <div>
              <Label>{t('sampleData')}</Label>
              <Textarea
                value={newFile.data}
                onChange={(e) => setNewFile({ ...newFile, data: e.target.value })}
                rows={8}
                placeholder={JSON.stringify(sampleData, null, 2)}
                data-testid="file-data-input"
                className="font-mono text-xs"
              />
              <p className="text-xs text-slate-500 mt-1">
                Enter data in JSON array format. Example above.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setNewFile({ ...newFile, data: JSON.stringify(sampleData, null, 2) })}
                className="flex-1"
                data-testid="use-sample-btn"
              >
                Use Sample Data
              </Button>
              <Button onClick={handleCreateFile} className="flex-1" data-testid="submit-file-btn">
                {t('generate')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExcelPage;