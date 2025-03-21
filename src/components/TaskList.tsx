import React, { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import TaskItem from './TaskItem';
import { sanitizeInput } from '../utils/validation';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) => {
  const [newTask, setNewTask] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const sanitizedTask = sanitizeInput(newTask);
      if (sanitizedTask && sanitizedTask.length <= 50) {
        onAddTask(sanitizedTask);
        setNewTask('');
        setIsAdding(false);
      }
    },
    [newTask, onAddTask]
  );

  return (
    <div className="relative min-h-[400px]">
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            id={task.id}
            text={task.text}
            completed={task.completed}
            onToggle={onToggleTask}
            onDelete={onDeleteTask}
          />
        ))}
        
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No tasks yet. Add your first task!
          </div>
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What needs to be done?"
              maxLength={50}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-md shadow-sm 
                focus:outline-none focus:ring-2 focus:ring-[#4299E1] focus:border-transparent
                transition-colors duration-200"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#2F855A] text-white rounded-md hover:bg-[#226D48] 
                transition-colors duration-200 shadow-sm"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 
                transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-[#2F855A] text-white rounded-full 
            shadow-lg hover:bg-[#226D48] transition-colors duration-200 flex items-center 
            justify-center group focus:outline-none focus:ring-2 focus:ring-offset-2 
            focus:ring-[#2F855A]"
        >
          <Plus className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
        </button>
      )}
    </div>
  );
};

export default TaskList;