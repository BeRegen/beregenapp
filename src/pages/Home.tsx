import React, { useState, useCallback, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import TaskList from '../components/TaskList';
import { setStorageItem, getStorageItem } from '../utils/storage';
import { ArrowUpDown, LayoutGrid, List, Tag, Check } from 'lucide-react';

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
      return updatedTasks;
    });
  }, []);

  const handleDeleteTask = useCallback((id: string) => {
    setTasks((prev: Task[]) => prev.filter((task: Task) => task.id !== id));
  }, []);

  const sortTasks = (tasks: Task[]): Task[] => {
    const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };
    return [...tasks].sort((a: Task, b: Task) => {
      if (sortMode === 'priority') {
        const aPriority = a.priority || 'none';
        const bPriority = b.priority || 'none';
        return priorityOrder[aPriority] - priorityOrder[bPriority];
      } else {
        return b.createdAt - a.createdAt;
      }
    });
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
                  
                  <div className="relative" ref={tagDropdownRef}>
                    <button
                      onClick={() => setShowTagDropdown(!showTagDropdown)}
                      className={`p-2 rounded-lg flex items-center gap-2 transition-all duration-200
                        ${selectedTag 
                          ? 'bg-gradient-to-r from-[#4CADCB] to-[#2C5A99] text-white shadow-sm' 
                          : 'text-[#698AAF] hover:bg-[#F1F2FD]'}`}
                      title="Filter by tag"
                    >
                      <Tag className="w-5 h-5" />
                      {selectedTag ? (
                        <span className="text-sm font-medium">{selectedTag}</span>
                      ) : (
                        <span className="text-sm font-medium">Tags</span>
                      )}
                    </button>
                    {showTagDropdown && (
                      <div className="absolute right-0 mt-2 bg-white/95 rounded-xl 
                        shadow-[0_8px_24px_-4px_rgba(44,90,153,0.15)] 
                        border border-white/50 backdrop-blur-sm p-3 z-50 min-w-[250px]"
                      >
                        <div className="flex flex-wrap gap-2 mb-3">
                          {getAllTags().map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-[#E8F0FE] text-[#2C5A99] rounded-full text-sm flex items-center gap-1"
                            >
                              {tag}
                              <button
                                onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                                className="hover:text-red-500"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>

                        {showNewTagInput ? (
                          <div className="flex gap-2 mb-3">
                            <input
                              type="text"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              placeholder="Add new tag"
                              className="flex-1 text-sm px-3 py-1.5 border border-white rounded-lg bg-white/80
                                focus:outline-none focus:ring-2 focus:ring-[#4CADCB]/20 focus:border-transparent
                                text-[#2C5A99] placeholder-[#698AAF]/70 shadow-sm backdrop-blur-sm"
                            />
                            <button
                              onClick={handleAddNewTag}
                              className="px-3 py-1.5 bg-[#E8F0FE] text-[#2C5A99] rounded-lg hover:bg-[#D0E3FF] 
                                transition-all duration-200 active:scale-95"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setShowNewTagInput(false)}
                              className="px-3 py-1.5 text-[#698AAF] hover:text-[#2C5A99] rounded-lg 
                                transition-all duration-200 active:scale-95"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowNewTagInput(true)}
                            className="w-full px-3 py-1.5 text-sm text-[#2C5A99] bg-[#F1F2FD] rounded-lg 
                              hover:bg-[#E8F0FE] transition-all duration-200 active:scale-95 mb-3"
                          >
                            + Add New Tag
                          </button>
                        )}

                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                          {defaultTags.map(tag => (
                            <button
                              key={tag}
                              onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                              className={`w-full px-3 py-1.5 text-sm rounded-lg flex items-center justify-between
                                ${selectedTag === tag 
                                  ? 'bg-[#E8F0FE] text-[#2C5A99]' 
                                  : 'text-[#2C5A99] hover:bg-[#F1F2FD]/50'}`}
                            >
                              <span>{tag}</span>
                              {selectedTag === tag && (
                                <Check className="w-4 h-4 text-[#4CADCB]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <TaskList
              tasks={filteredTasks}
              onTaskAdd={handleAddTask}
              onTaskUpdate={handleUpdateTask}
              onTaskDelete={handleDeleteTask}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;