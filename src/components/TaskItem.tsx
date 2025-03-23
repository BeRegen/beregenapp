import React, { memo } from 'react';
import { Check, Trash2, Clock, Link as LinkIcon } from 'lucide-react';

interface TaskItemProps {
  id: string;
  text: string;
  completed: boolean;
  title?: string;
  alarm?: string;
  link?: string;
  tags?: string[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = memo(({ 
  id, 
  text, 
  completed, 
  title,
  alarm,
  link,
  tags,
  onToggle, 
  onDelete 
}) => {
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Handle bullet points
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="ml-6">
            {renderInlineFormatting(line.substring(2))}
          </li>
        );
      }
      return (
        <p key={index} className="mb-1">
          {renderInlineFormatting(line)}
        </p>
      );
    });
  };

  const renderInlineFormatting = (content: string) => {
    // Replace **text** with <strong> and *text* with <em>
    const parts = content.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div 
      className={`transform transition-all duration-300 ease-in-out
        ${completed ? 'opacity-75' : 'opacity-100'}
        group flex flex-col p-4 bg-white rounded-lg border border-gray-200
        hover:border-gray-300 hover:shadow-sm`}
    >
      <div className="flex items-start">
        <button
          onClick={() => onToggle(id)}
          className={`flex-shrink-0 w-6 h-6 rounded-md border-2 mr-4 mt-1
            transition-colors duration-200 flex items-center justify-center
            ${completed 
              ? 'bg-[#2F855A] border-[#2F855A]' 
              : 'border-gray-300 hover:border-[#2F855A]'
            }`}
        >
          {completed && <Check className="w-4 h-4 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="font-bold text-gray-900 mb-1">
              {title}
            </h3>
          )}
          
          <div className={`${completed ? 'text-gray-500 line-through' : 'text-gray-900'}
            transition-colors duration-200`}
          >
            {renderFormattedText(text)}
          </div>

          <div className="mt-3 space-y-2">
            {alarm && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                {new Date(alarm).toLocaleString()}
              </div>
            )}

            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 
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
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(id)}
          className="ml-4 text-gray-400 hover:text-red-500 transition-colors duration-200
            opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});

TaskItem.displayName = 'TaskItem';

export default TaskItem;