import React, { useState, useCallback, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import TaskList from '../components/TaskList';
import { setStorageItem, getStorageItem } from '../utils/storage';
import { ArrowUpDown, LayoutGrid, List, Tag, Check, Trash2 } from 'lucide-react';
import { TrashItem } from '../types';
import Button from '../components/Button';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  title?: string;
  alarm?: string;
  subItems?: string[];
  link?: string;
  tags?: string[];
  priority?: 'high' | 'medium' | 'low';
  createdAt: number;
  order?: number;
}

type SortMode = 'priority' | 'date';
type ViewMode = 'list' | 'grid';
type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

const defaultTags = [
  // Life Areas
  'Work', 'Personal', 'Family', 'Health', 'Finance', 'Education', 'Social', 'Home', 'Travel', 'Shopping',
  // Time Management
  'Today', 'This Week', 'This Month', 'Urgent', 'Later', 'Scheduled',
  // Project Types
  'Planning', 'Research', 'Review', 'Follow-up', 'Meeting', 'Deadline'
];

const Home: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const storedTasks = getStorageItem<Task[]>('tasks', []);
    console.log('Initial tasks loaded:', storedTasks);
    return storedTasks;
  });
  const [sortMode, setSortMode] = useState<SortMode>('priority');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    console.log('Tasks updated:', tasks);
    setStorageItem('tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddTask = useCallback((taskData: Partial<Task>) => {
    console.log('Home component adding/updating task:', taskData);
    setTasks((prev: Task[]) => {
      const newTask: Task = {
        id: taskData.id || Math.random().toString(36).substring(2) + Date.now().toString(36),
        text: taskData.text || '',
        completed: taskData.completed ?? false,
        title: taskData.title || '',
        alarm: taskData.alarm || '',
        subItems: taskData.subItems || [],
        link: taskData.link || '',
        tags: taskData.tags || [],
        priority: taskData.priority,
        createdAt: taskData.id ? (prev.find((t: Task) => t.id === taskData.id)?.createdAt || Date.now()) : Date.now(),
        order: taskData.order,
      };

      console.log('Created new task:', newTask);
      const updatedTasks = taskData.id
        ? prev.map((task: Task) => (task.id === taskData.id ? { ...task, ...taskData } : task))
        : [...prev, newTask];

      console.log('Updated tasks array:', updatedTasks);
      return sortTasks(updatedTasks);
    });
  }, []);

  const handleUpdateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    console.log('Updating task:', taskId, updates);
    setTasks((prev: Task[]) => {
      const updatedTasks = prev.map((task: Task) =>
        task.id === taskId ? { ...task, ...updates } : task
      );
      console.log('Updated tasks:', updatedTasks);
      return sortTasks(updatedTasks);
    });
  }, []);

  const handleDeleteTask = useCallback((id: string) => {
    setTasks((prev: Task[]) => prev.filter((task: Task) => task.id !== id));
  }, []);

  const handleBulkDelete = (taskIds: string[]) => {
    const tasksToDelete = tasks.filter(task => taskIds.includes(task.id));
    const trashItems: TrashItem[] = tasksToDelete.map(task => ({
      task: { ...task, deletedAt: Date.now() },
      deletedAt: Date.now()
    }));

    // Add to trash
    const currentTrashedItems = getStorageItem<TrashItem[]>('trashedItems', []);
    setStorageItem('trashedItems', [...currentTrashedItems, ...trashItems]);

    // Remove from active tasks
    setTasks(prev => prev.filter(task => !taskIds.includes(task.id)));
    setSelectedTasks(new Set());
    setIsSelectionMode(false);
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(taskId)) {
        newSelected.delete(taskId);
      } else {
        newSelected.add(taskId);
      }
      return newSelected;
    });
  };

  const toggleSelectAll = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredTasks.map(task => task.id)));
    }
  };

  const sortTasks = (tasks: Task[]): Task[] => {
    if (sortMode === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };
      return [...tasks].sort((a: Task, b: Task) => {
        const aPriority = a.priority || 'none';
        const bPriority = b.priority || 'none';
        return priorityOrder[aPriority] - priorityOrder[bPriority];
      });
    } else if (sortMode === 'date') {
      return [...tasks].sort((a: Task, b: Task) => b.createdAt - a.createdAt);
    } else {
      // Default to manual order
      return [...tasks].sort((a: Task, b: Task) => {
        const aOrder = a.order ?? Number.MAX_SAFE_INTEGER;
        const bOrder = b.order ?? Number.MAX_SAFE_INTEGER;
        return aOrder - bOrder;
      });
    }
  };

  const getAllTags = useCallback(() => {
    const tagsSet = new Set<string>();
    tasks.forEach(task => {
      task.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [tasks]);

  const filteredTasks = sortTasks(tasks.filter((task: Task) => {
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesTag = !selectedTag || task.tags?.includes(selectedTag);
    return matchesPriority && matchesTag;
  }));

  console.log('Filtered tasks:', filteredTasks);

  const getPriorityColor = (priority?: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const handleAddNewTag = () => {
    if (newTag.trim()) {
      setTasks(prev => {
        const updatedTasks = prev.map(task => {
          if (task.id === editingTask?.id) {
            return {
              ...task,
              tags: [...(task.tags || []), newTag.trim()]
            };
          }
          return task;
        });
        return updatedTasks;
      });
      setNewTag('');
      setShowNewTagInput(false);
    }
  };

  const handleTasksReorder = (reorderedTasks: Task[]) => {
    // Update tasks with new order
    const updatedTasks = reorderedTasks.map((task, index) => ({
      ...task,
      order: index
    }));
    setTasks(updatedTasks);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <Navbar />
      <main className="flex-1 md:ml-64 p-6 md:pt-6 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-[#2C5A99]">My Tasks</h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white rounded-lg p-1.5 shadow-md">
                  <button
                    onClick={() => setSortMode(sortMode === 'priority' ? 'date' : 'priority')}
                    className={`p-2 rounded-lg flex items-center gap-2 transition-all duration-200
                      ${sortMode === 'priority' 
                        ? 'bg-gradient-to-r from-[#4CADCB] to-[#2C5A99] text-white shadow-sm' 
                        : 'text-[#698AAF] hover:bg-[#F1F2FD]'}`}
                    title={`Sort by ${sortMode === 'priority' ? 'date' : 'priority'}`}
                  >
                    <ArrowUpDown className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {sortMode === 'priority' ? 'Priority' : 'Date'}
                    </span>
                  </button>
                  
                  <div className="h-6 w-px bg-[#F1F2FD]" />
                  
                  <button
                    onClick={() => setIsSelectionMode(!isSelectionMode)}
                    className={`p-2 rounded-lg flex items-center gap-2 transition-all duration-200
                      ${isSelectionMode
                        ? 'bg-gradient-to-r from-[#4CADCB] to-[#2C5A99] text-white shadow-sm' 
                        : 'text-[#698AAF] hover:bg-[#F1F2FD]'}`}
                    title="Select tasks to delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {isSelectionMode && (
              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant="secondary"
                  onClick={toggleSelectAll}
                  className="px-4 py-2 text-[#2C5A99] bg-white rounded-lg border border-white
                    hover:bg-[#F1F2FD] transition-all duration-200"
                >
                  {selectedTasks.size === filteredTasks.length ? 'Deselect All' : 'Select All'}
                </Button>
                {selectedTasks.size > 0 && (
                  <Button
                    variant="primary"
                    onClick={() => handleBulkDelete(Array.from(selectedTasks))}
                    className="px-4 py-2 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-lg
                      hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Move to Trash ({selectedTasks.size})
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <TaskList
              tasks={filteredTasks}
              onTaskAdd={handleAddTask}
              onTaskUpdate={handleUpdateTask}
              onTaskDelete={handleDeleteTask}
              isSelectionMode={isSelectionMode}
              selectedTasks={selectedTasks}
              onTaskSelect={toggleTaskSelection}
              onTasksReorder={handleTasksReorder}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;