import React, { useState, useCallback, useEffect } from 'react';
import Navbar from '../components/Navbar';
import TaskList from '../components/TaskList';
import { setStorageItem, getStorageItem } from '../utils/storage';

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
}

const Home: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() =>
    getStorageItem<Task[]>('tasks', [])
  );

  useEffect(() => {
    setStorageItem('tasks', tasks);
  }, [tasks]);

  const handleAddTask = useCallback((taskData: Partial<Task>) => {
    setTasks((prev) => {
      const newTask = {
        id: taskData.id || crypto.randomUUID(),
        text: taskData.text || '',
        completed: false,
        title: taskData.title || '',
        alarm: taskData.alarm || '',
        subItems: taskData.subItems || [],
        link: taskData.link || '',
        tags: taskData.tags || [],
        priority: taskData.priority,
      };

      const updatedTasks = taskData.id
        ? prev.map((task) => (task.id === taskData.id ? newTask : task))
        : [...prev, newTask];

      return sortTasks(updatedTasks);
    });
  }, []);

  const handleToggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const handleDeleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const sortTasks = (tasks: Task[]): Task[] => {
    const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };
    return [...tasks].sort((a, b) => {
      const aPriority = a.priority || 'none';
      const bPriority = b.priority || 'none';
      return priorityOrder[aPriority] - priorityOrder[bPriority];
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      <Navbar />
      <main className="flex-1 md:ml-64 p-6 md:pt-6 pt-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Tasks</h1>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <TaskList
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;