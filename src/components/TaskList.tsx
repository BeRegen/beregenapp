import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, ChevronDown, ChevronUp, Flag, Check } from 'lucide-react';
import TaskActions from './TaskActions';
import TaskFormModal from './TaskFormModal';
import Button from './Button';
import { Task, Priority } from '../types';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskAdd: (task: Partial<Task>) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskUpdate,
  onTaskDelete,
  onTaskAdd,
}) => {
  console.log('TaskList rendering with tasks:', tasks);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activePriorityDropdown, setActivePriorityDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActivePriorityDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.title?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filter === 'all' ||
      (filter === 'active' && !task.completed) ||
      (filter === 'completed' && task.completed);
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesFilter && matchesPriority;
  });

  console.log('Filtered tasks:', filteredTasks);

  const handleTaskToggle = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      console.log('Toggling task completion:', taskId, !task.completed);
      onTaskUpdate(taskId, { 
        completed: !task.completed,
        completedAt: !task.completed ? Date.now() : undefined
      });
    }
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleTaskDelete = (taskId: string) => {
    onTaskDelete(taskId);
  };

  const handlePriorityChange = (taskId: string, priority: 'high' | 'medium' | 'low') => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      onTaskUpdate(taskId, { 
        ...task,
        priority
      });
      setActivePriorityDropdown(null);
    }
  };

  const getPriorityColor = (priority?: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-[#6B7280]';
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#698AAF] w-5 h-5" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-white
              focus:outline-none focus:ring-2 focus:ring-[#4CADCB]/20 focus:border-transparent
              text-[#2C5A99] placeholder-[#698AAF]/70 shadow-sm backdrop-blur-sm"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
          className="px-4 py-2 bg-white rounded-lg border border-white
            focus:outline-none focus:ring-2 focus:ring-[#4CADCB]/20 focus:border-transparent
            text-[#2C5A99] min-w-[120px] shadow-sm backdrop-blur-sm"
        >
          <option value="all">All Tasks</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as 'all' | Priority)}
          className="px-4 py-2 bg-white rounded-lg border border-white
            focus:outline-none focus:ring-2 focus:ring-[#4CADCB]/20 focus:border-transparent
            text-[#2C5A99] min-w-[120px] shadow-sm backdrop-blur-sm"
        >
          <option value="all">Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#4CADCB] to-[#2C5A99] text-white rounded-lg 
            hover:shadow-lg hover:shadow-[#4CADCB]/10 transition-all duration-200 active:scale-95
            shadow-md shadow-[#4CADCB]/5 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </Button>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {filter === 'completed' 
            ? "No completed tasks yet."
            : filter === 'active'
            ? "No active tasks."
            : "No tasks yet. Click the \"Add Task\" button to create your first task!"}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map(task => {
            console.log('Rendering task:', task);
            return (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow-sm border border-white/50 backdrop-blur-sm
                  hover:shadow-md transition-all duration-200"
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          {task.title && (
                            <h3 className="text-lg font-semibold text-[#2C5A99] mb-2">
                              {task.title}
                            </h3>
                          )}
                          <div
                            className={`text-[#698AAF] ${task.completed ? 'line-through text-[#698AAF]/70' : ''}`}
                            dangerouslySetInnerHTML={{ __html: task.text }}
                          />
                        </div>
                        <div className="flex items-start gap-2">
                          {task.alarm && (
                            <div className="text-sm text-[#698AAF]/70 whitespace-nowrap">
                              Due: {new Date(task.alarm).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {task.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-[#E8F0FE] text-[#2C5A99] rounded-full text-sm 
                                hover:bg-[#D0E3FF] transition-all duration-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-2 border-t border-white/50 bg-[#F8F9FA]">
                  <div className="flex items-center gap-3">
                    <TaskActions
                      taskId={task.id}
                      isCompleted={task.completed}
                      onToggle={handleTaskToggle}
                      onEdit={() => handleTaskEdit(task)}
                      onDelete={() => handleTaskDelete(task.id)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full transition-all duration-200 ${getPriorityColor(task.priority)}`}>
                      <Flag className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskFormModal
        isOpen={isModalOpen}
        editingTask={editingTask}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={(taskData) => {
          if (editingTask) {
            onTaskUpdate(editingTask.id, taskData);
          } else {
            onTaskAdd(taskData);
          }
          setIsModalOpen(false);
          setEditingTask(null);
        }}
      />
    </div>
  );
};

export default TaskList;