import React, { memo } from 'react';
import { Check, Trash2, Clock, Link as LinkIcon, Pencil } from 'lucide-react';

interface TaskItemProps {
  id: string;
  text: string;
  completed: boolean;
  title?: string;
  alarm?: string;
  link?: string;
  tags?: string[];
  priority?: 'high' | 'medium' | 'low';
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: () => void;
}

const TaskItem: React.FC<TaskItemProps> = memo(({ 
  id, 
  text, 
  completed, 
  title,
  alarm,
  link,
  tags,
  priority,
  onToggle, 
  onDelete,
  onEdit 
}) => {
  const getPriorityColor = (priority?: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'hidden';
    }
  };

  return (
    <div 
      className={`transform transition-all duration-200 ease-in-out
        ${completed ? 'opacity-75' : 'opacity-100'}
        group flex flex-col p-4 bg-white rounded-xl shadow-sm border border-[#E5E7EB]
        hover:shadow-md`}
    >
      <div className="flex items-start">
        {priority && (
          <div className={`w-4 h-4 rounded-full mr-2 mt-2 ${getPriorityColor(priority)}`} />
        )}
        <button
          onClick={() => onToggle(id)}
          className={`flex-shrink-0 w-6 h-6 rounded-md border-2 mr-4 mt-1
            transition-colors duration-200 flex items-center justify-center
            ${completed 
              ? 'bg-[#10B981] border-[#10B981]' 
              : 'border-[#E5E7EB] hover:border-[#10B981]'
            }`}
        >
          {completed && <Check className="w-4 h-4 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-xl font-semibold text-[#1F2937] mb-1">
              {title}
            </h3>
          )}
          
          <div 
            className={`${completed ? 'text-[#6B7280] line-through' : 'text-[#1F2937]'}
              text-base font-normal transition-colors duration-200`}
            dangerouslySetInnerHTML={{ __html: text }}
          />

          <div className="mt-3 space-y-2">
            {alarm && (
              <div className="flex items-center text-sm text-[#6B7280]">
                <Clock className="w-4 h-4 mr-2" />
                {new Date(alarm).toLocaleString()}
              </div>
            )}

            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-[#10B981] hover:text-[#0A9C6D] 
                  transition-colors duration-200"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                {link}
              </a>
            )}

            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-[#F9FAFB] text-[#6B7280] rounded-md text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={onEdit}
            className="text-[#6B7280] hover:text-[#10B981] transition-all duration-200
              opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-105"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="text-[#6B7280] hover:text-[#10B981] transition-all duration-200
              opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-105"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
});

TaskItem.displayName = 'TaskItem';

export default TaskItem;