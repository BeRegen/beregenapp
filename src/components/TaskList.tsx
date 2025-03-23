import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Clock, Link as LinkIcon, Bold, Italic, List } from 'lucide-react';
import TaskItem from './TaskItem';
import { sanitizeInput } from '../utils/validation';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  title?: string;
  alarm?: string;
  subItems?: string[];
  link?: string;
  tags?: string[];
}

interface TaskListProps {
  tasks: Task[];
  onAddTask: (task: Partial<Task>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [alarm, setAlarm] = useState('');
  const [link, setLink] = useState('');
  const [tags, setTags] = useState('');
  const titleRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAdding && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isAdding]);

  const resetForm = () => {
    if (titleRef.current) titleRef.current.textContent = '';
    if (descriptionRef.current) descriptionRef.current.textContent = '';
    setAlarm('');
    setLink('');
    setTags('');
    setIsAdding(false);
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const title = titleRef.current?.textContent || '';
      const description = descriptionRef.current?.textContent || '';
      
      const sanitizedTitle = sanitizeInput(title);
      const sanitizedText = sanitizeInput(description);
      
      if (sanitizedText) {
        const taskData: Partial<Task> = {
          text: sanitizedText,
          ...(sanitizedTitle ? { title: sanitizedTitle } : {}),
          ...(alarm ? { alarm } : {}),
          ...(link ? { link } : {}),
          ...(tags ? { tags: tags.split(',').map(tag => tag.trim()) } : {}),
        };

        onAddTask(taskData);
        resetForm();
      }
    },
    [alarm, link, tags, onAddTask]
  );

  const handleFormat = (type: 'bold' | 'italic' | 'bullet') => {
    if (!descriptionRef.current) return;
    
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    
    if (!selection || !range) return;

    switch (type) {
      case 'bold': {
        const strong = document.createElement('strong');
        if (selection.toString()) {
          strong.textContent = selection.toString();
          range.deleteContents();
          range.insertNode(strong);
        }
        break;
      }
      case 'italic': {
        const em = document.createElement('em');
        if (selection.toString()) {
          em.textContent = selection.toString();
          range.deleteContents();
          range.insertNode(em);
        }
        break;
      }
      case 'bullet': {
        const bullet = document.createTextNode('\n- ');
        range.insertNode(bullet);
        range.setStartAfter(bullet);
        range.setEndAfter(bullet);
        break;
      }
    }
    
    descriptionRef.current.focus();
  };

  return (
    <div className="relative min-h-[400px]">
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            {...task}
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

      {isAdding && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={resetForm}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            bg-white p-6 rounded-lg shadow-xl max-w-lg w-full z-50"
          >
            <div
              ref={titleRef}
              contentEditable
              className="text-lg font-bold text-gray-700 w-full px-3 py-2 border-b border-gray-200 
                focus:outline-none empty:before:content-[attr(data-placeholder)] 
                empty:before:text-gray-400"
              data-placeholder="Title Here..."
            />
            
            <div
              ref={descriptionRef}
              contentEditable
              className="text-base text-gray-600 w-full px-3 py-2 border-b border-gray-200 
                focus:outline-none min-h-[100px] empty:before:content-[attr(data-placeholder)] 
                empty:before:text-gray-400"
              data-placeholder="Task description here..."
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 
                  transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-[#2F855A] text-white rounded-md hover:bg-[#226D48] 
                  transition-colors duration-200 shadow-sm"
              >
                Add
              </button>
            </div>

            <div className="bg-gray-100 p-2 rounded-b-lg border-t border-gray-200 -mb-6 mt-4">
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-gray-500" />
                  <input
                    type="datetime-local"
                    value={alarm}
                    onChange={(e) => setAlarm(e.target.value)}
                    className="text-sm px-2 py-1 border border-gray-200 rounded-md
                      focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                  />
                </div>

                <div className="flex items-center flex-1 min-w-[200px]">
                  <LinkIcon className="w-4 h-4 mr-1 text-gray-500" />
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="Add a link"
                    className="flex-1 text-sm px-2 py-1 border border-gray-200 rounded-md
                      focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                  />
                </div>

                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Tags (comma-separated)"
                  className="flex-1 text-sm px-2 py-1 border border-gray-200 rounded-md
                    focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                />

                <button
                  type="button"
                  onClick={() => handleFormat('bold')}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Bold className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleFormat('italic')}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Italic className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleFormat('bullet')}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <button
        onClick={() => setIsAdding(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#2F855A] text-white rounded-full 
          shadow-lg hover:bg-[#226D48] transition-colors duration-200 flex items-center 
          justify-center group focus:outline-none focus:ring-2 focus:ring-offset-2 
          focus:ring-[#2F855A]"
      >
        <Plus className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
      </button>
    </div>
  );
};

export default TaskList;