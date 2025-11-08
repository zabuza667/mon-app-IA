import React, { useEffect, useState } from 'react';
import { CheckSquare, Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import api from '../utils/api';
import { toast } from 'sonner';

const TasksPage = () => {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    task_type: 'email',
    priority: 'medium',
    due_date: '',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast.error(t('error'), { description: 'Title is required' });
      return;
    }

    try {
      await api.post('/tasks', newTask);
      toast.success(t('success'), { description: 'Task created' });
      setShowCreate(false);
      setNewTask({ title: '', description: '', task_type: 'email', priority: 'medium', due_date: '' });
      await fetchTasks();
    } catch (error) {
      toast.error(t('error'), { description: 'Failed to create task' });
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}?status=${newStatus}`);
      toast.success(t('success'), { description: 'Task updated' });
      await fetchTasks();
    } catch (error) {
      toast.error(t('error'), { description: 'Failed to update task' });
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500';
      case 'medium': return 'border-l-4 border-yellow-500';
      case 'low': return 'border-l-4 border-green-500';
      default: return 'border-l-4 border-slate-300';
    }
  };

  const TaskColumn = ({ title, status, tasks }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100" data-testid={`task-column-${status}`}>
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
        <CheckSquare size={20} />
        {title} ({tasks.length})
      </h3>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`bg-slate-50 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer ${getPriorityColor(task.priority)}`}
            data-testid={`task-card-${task.id}`}
          >
            <h4 className="font-bold text-slate-800 mb-2">{task.title}</h4>
            <p className="text-sm text-slate-600 mb-3">{task.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                {task.task_type}
              </span>
              <Select
                value={task.status}
                onValueChange={(value) => handleUpdateTaskStatus(task.id, value)}
              >
                <SelectTrigger className="w-32 h-8 text-xs" data-testid={`task-status-select-${task.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">{t('todo')}</SelectItem>
                  <SelectItem value="in_validation">{t('inValidation')}</SelectItem>
                  <SelectItem value="done">{t('done')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8" data-testid="tasks-page">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <CheckSquare className="text-green-500" size={32} />
            <h1 className="text-4xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              {t('taskBoard')}
            </h1>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            data-testid="create-task-btn"
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Plus size={18} className="mr-2" />
            {t('newTask')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TaskColumn title={t('todo')} status="todo" tasks={getTasksByStatus('todo')} />
          <TaskColumn title={t('inValidation')} status="in_validation" tasks={getTasksByStatus('in_validation')} />
          <TaskColumn title={t('done')} status="done" tasks={getTasksByStatus('done')} />
        </div>
      </div>

      {/* Create Task Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl" data-testid="create-task-dialog">
          <DialogHeader>
            <DialogTitle>{t('newTask')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('taskTitle')}</Label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
                data-testid="task-title-input"
              />
            </div>
            <div>
              <Label>{t('taskDescription')}</Label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows={4}
                placeholder="Enter task description"
                data-testid="task-description-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('taskType')}</Label>
                <Select
                  value={newTask.task_type}
                  onValueChange={(value) => setNewTask({ ...newTask, task_type: value })}
                >
                  <SelectTrigger data-testid="task-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="calendar">Calendar</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('priority')}</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger data-testid="task-priority-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('low')}</SelectItem>
                    <SelectItem value="medium">{t('medium')}</SelectItem>
                    <SelectItem value="high">{t('high')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{t('dueDate')}</Label>
              <Input
                type="datetime-local"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                data-testid="task-due-date-input"
              />
            </div>
            <Button onClick={handleCreateTask} className="w-full" data-testid="submit-task-btn">
              {t('createTask')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksPage;