import React, { memo } from 'react';
import { Check, Trash2 } from 'lucide-react';

interface TaskItemProps {
  id: string;
  text: string;
  completed: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = memo(({ id, text, completed, onToggle, onDelete }) => {
  return (
    <div 
      className={`transform transition-all duration-300 ease-in-out
        ${completed ? 'opacity-75' : 'opacity-100'}
        group flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200
        hover:border-gray-300 hover:shadow-sm`}
    >
      <div className="flex items-center flex-1 min-w-0">
        <button
          onClick={() => onToggle(id)}
          className={`flex-shrink-0 w-6 h-6 rounded-md border-2 mr-4 
            transition-colors duration-200 flex items-center justify-center
            ${completed 
              ? 'bg-[#2F855A] border-[#2F855A]' 
              : 'border-gray-300 hover:border-[#2F855A]'
            }`}
        >
          {completed && <Check className="w-4 h-4 text-white" />}
        </button>
        <span className={`flex-1 min-w-0 break-words ${
          completed 
            ? 'text-gray-500 line-through' 
            : 'text-gray-900'
          } transition-colors duration-200`}
        >
          {text}
        </span>
      </div>
      <button
        onClick={() => onDelete(id)}
        className="ml-4 text-gray-400 hover:text-red-500 transition-colors duration-200
          opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
});

TaskItem.displayName = 'TaskItem';

export default TaskItem;