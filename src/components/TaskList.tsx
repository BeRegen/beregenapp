import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Plus, Search, ChevronDown, ChevronUp, Flag, Check, CheckCircle, Circle, Edit2, Trash2, ChevronRight } from 'lucide-react';
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
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set());
  const textRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [longTasks, setLongTasks] = useState<Set<string>>(new Set());

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

  useLayoutEffect(() => {
    const lineHeight = 24; // Approximate line height in pixels
    const threeLineHeight = lineHeight * 3;
    
    Object.entries(textRefs.current).forEach(([taskId, element]) => {
      if (element) {
        const isLong = element.scrollHeight > threeLineHeight;
        setLongTasks(prev => {
          const newSet = new Set(prev);
          if (isLong) {
            newSet.add(taskId);
          } else {
            newSet.delete(taskId);
          }
          return newSet;
        });
      }
    });
  }, [tasks]);

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

  const toggleCollapse = (taskId: string) => {
    setCollapsedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
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
        <div className="divide-y divide-[#E8F0FE]/80">
          {filteredTasks.map(task => {
            console.log('Rendering task:', task);
            const isCollapsed = collapsedTasks.has(task.id);
            return (
              <div
                key={task.id}
                className="group relative hover:bg-[#F8F9FA] transition-colors duration-200 py-4"
              >
                <div className="flex">
                  <div className="pl-2">
                    <button
                      onClick={() => handleTaskToggle(task.id)}
                      className={`p-1 rounded-full transition-all duration-200 group
                        hover:bg-white/80 hover:shadow-sm active:scale-95
                        ${task.completed ? 'bg-white shadow-sm ring-1 ring-[#4CADCB]/20' : ''}`}
                    >
                      {task.completed ? (
                        <CheckCircle className="w-3.5 h-3.5 text-[#4CADCB]" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-[#2C5A99] group-hover:text-[#4CADCB]" />
                      )}
                    </button>
                  </div>
                  
                  <div className="flex-1 pl-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        {task.title && (
                          <div className="relative">
                            <div className="flex items-start">
                              {longTasks.has(task.id) && (
                                <button
                                  onClick={() => toggleCollapse(task.id)}
                                  className="p-1 mr-2 rounded-full text-[#2C5A99] transition-all duration-200
                                    hover:bg-white/80 hover:shadow-sm active:scale-95"
                                >
                                  <ChevronRight 
                                    className={`w-4 h-4 transform transition-transform duration-200 
                                      ${isCollapsed ? '' : 'rotate-90'}`}
                                  />
                                </button>
                              )}
                              <div>
                                <h3 className={`text-lg font-semibold text-[#2C5A99] ${task.completed ? 'line-through text-[#2C5A99]/70' : ''}`}>
                                  {task.title}
                                </h3>
                                <div className="w-1/3 h-px bg-[#E8F0FE]/50 mt-2" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2 invisible group-hover:visible">
                        <button
                          onClick={() => handleTaskEdit(task)}
                          className="p-1.5 rounded-full text-[#2C5A99] transition-all duration-200
                            hover:bg-white/80 hover:shadow-sm active:scale-95
                            hover:text-[#4CADCB]"
                          title="Edit task"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleTaskDelete(task.id)}
                          className="p-1.5 rounded-full text-[#2C5A99] transition-all duration-200
                            hover:bg-white/80 hover:shadow-sm active:scale-95
                            hover:text-red-500"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div 
                      className={`transition-all duration-200 
                        ${longTasks.has(task.id) && isCollapsed 
                          ? 'h-[72px] overflow-hidden' 
                          : 'min-h-[72px]'}`}
                    >
                      <div
                        ref={el => textRefs.current[task.id] = el}
                        className={`text-[#698AAF] leading-6 
                          ${longTasks.has(task.id) && isCollapsed ? 'line-clamp-3' : ''} 
                          ${task.completed ? 'line-through text-[#698AAF]/70' : ''}`}
                        dangerouslySetInnerHTML={{ __html: task.text }}
                      />
                      
                      <div className="flex justify-between items-end mt-2">
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
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
                        
                        <div className="flex items-center gap-2 ml-auto">
                          {task.alarm && (
                            <div className="text-sm text-[#698AAF]/70 whitespace-nowrap">
                              Due: {new Date(task.alarm).toLocaleString()}
                            </div>
                          )}
                          {task.priority && (
                            <div className={`p-1 rounded-full transition-all duration-200 ${getPriorityColor(task.priority)}`}>
                              <Flag className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </div>
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