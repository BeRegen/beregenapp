import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Clock, Link as LinkIcon, Bold, Italic, List, Tag, Flag } from 'lucide-react';
import TaskItem from './TaskItem';
import { sanitizeInput } from '../utils/validation';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  title?: string;
  alarm?: string;
  link?: string;
  tags?: string[];
  priority?: 'high' | 'medium' | 'low';
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
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showAlarmInput, setShowAlarmInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [alarm, setAlarm] = useState('');
  const [link, setLink] = useState('');
  const [tags, setTags] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low' | undefined>();
  const titleRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((isAdding || editingTask) && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isAdding, editingTask]);

  useEffect(() => {
    if (editingTask) {
      if (titleRef.current) titleRef.current.textContent = editingTask.title || '';
      if (descriptionRef.current) descriptionRef.current.innerHTML = editingTask.text || '';
      setAlarm(editingTask.alarm || '');
      setLink(editingTask.link || '');
      setTags(editingTask.tags?.join(', ') || '');
      setPriority(editingTask.priority);
      setIsAdding(true);
    }
  }, [editingTask]);

  const resetForm = () => {
    if (titleRef.current) titleRef.current.textContent = '';
    if (descriptionRef.current) descriptionRef.current.innerHTML = '';
    setAlarm('');
    setLink('');
    setTags('');
    setPriority(undefined);
    setShowAlarmInput(false);
    setShowLinkInput(false);
    setShowTagInput(false);
    setShowPriorityDropdown(false);
    setIsAdding(false);
    setEditingTask(null);
  };

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const title = titleRef.current?.textContent || '';
      const description = descriptionRef.current?.innerHTML || '';
      
      const sanitizedTitle = sanitizeInput(title);
      
      if (description) {
        const taskData: Partial<Task> = {
          text: description,
          ...(sanitizedTitle ? { title: sanitizedTitle } : {}),
          ...(alarm ? { alarm } : {}),
          ...(link ? { link } : {}),
          ...(tags ? { tags: tags.split(',').map(tag => tag.trim()) } : {}),
          ...(priority ? { priority } : {}),
        };

        if (editingTask) {
          onAddTask({ ...taskData, id: editingTask.id });
        } else {
          onAddTask(taskData);
        }
        resetForm();
      }
    },
    [alarm, link, tags, priority, onAddTask, editingTask]
  );

  const handleFormat = (command: string) => {
    if (!descriptionRef.current) return;
    document.execCommand(command, false);
    descriptionRef.current.focus();
  };

  const handleBulletPoint = () => {
    if (!descriptionRef.current) return;
    document.execCommand('insertHTML', false, '<div class="list-disc ml-4 text-[#6B7280]">• </div>');
    descriptionRef.current.focus();
  };

  const handleTagAdd = (value: string) => {
    const newTags = value.split(',').map(tag => tag.trim()).filter(Boolean);
    setTags(newTags.join(', '));
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
            onEdit={() => setEditingTask(task)}
          />
        ))}
        
        {tasks.length === 0 && (
          <div className="text-center py-8 text-[#6B7280]">
            No tasks yet. Add your first task!
          </div>
        )}
      </div>

      {isAdding && (
        <>
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-60 z-40"
            onClick={handleSubmit}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-[#E5E7EB] 
            max-w-[90vw] w-full max-h-[80vh] overflow-y-auto max-w-lg z-50"
          >
            <div
              ref={titleRef}
              contentEditable
              className="text-lg sm:text-xl font-semibold text-[#1F2937] w-full px-3 py-2 
                border-b border-[#E5E7EB] focus:outline-none 
                empty:before:content-[attr(data-placeholder)] empty:before:text-[#6B7280]"
              data-placeholder="Title Here..."
            />
            
            <div
              ref={descriptionRef}
              contentEditable
              className="text-sm sm:text-base font-normal text-[#1F2937] w-full px-3 py-2 
                border-b border-[#E5E7EB] focus:outline-none min-h-[80px] sm:min-h-[100px]
                empty:before:content-[attr(data-placeholder)] empty:before:text-[#6B7280]"
              data-placeholder="Task description here..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  document.execCommand('insertLineBreak', false);
                }
              }}
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-[#E5E7EB] text-[#1F2937] rounded-md 
                  hover:bg-[#D1D5DB] transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit()}
                className="px-4 py-2 bg-[#10B981] text-white rounded-md hover:bg-[#0A9C6D] 
                  transition-colors duration-200 shadow-sm"
              >
                {editingTask ? 'Update' : 'Add'}
              </button>
            </div>

            <div className="bg-[#F9FAFB] p-2 rounded-b-xl border-t border-[#E5E7EB] -mb-6 mt-4">
              <div className="flex flex-nowrap gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setShowAlarmInput(!showAlarmInput)}
                  className="w-6 h-6 text-[#6B7280] hover:text-[#10B981] 
                    transition-all duration-200 hover:scale-105 flex-shrink-0"
                >
                  <Clock className="w-6 h-6" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowLinkInput(!showLinkInput)}
                  className="w-6 h-6 text-[#6B7280] hover:text-[#10B981] 
                    transition-all duration-200 hover:scale-105 flex-shrink-0"
                >
                  <LinkIcon className="w-6 h-6" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowTagInput(!showTagInput)}
                  className="w-6 h-6 text-[#6B7280] hover:text-[#10B981] 
                    transition-all duration-200 hover:scale-105 flex-shrink-0"
                >
                  <Tag className="w-6 h-6" />
                </button>

                <div className="relative flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                    className="w-6 h-6 text-[#6B7280] hover:text-[#10B981] 
                      transition-all duration-200 hover:scale-105"
                  >
                    <Flag className="w-6 h-6" />
                  </button>
                  {showPriorityDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg 
                      border border-[#E5E7EB] p-1 z-50"
                    >
                      <button
                        onClick={() => { setPriority('high'); setShowPriorityDropdown(false); }}
                        className="w-full px-2 py-1 text-white bg-red-500 rounded 
                          hover:opacity-80 mb-1"
                      >
                        High
                      </button>
                      <button
                        onClick={() => { setPriority('medium'); setShowPriorityDropdown(false); }}
                        className="w-full px-2 py-1 text-white bg-yellow-500 rounded 
                          hover:opacity-80 mb-1"
                      >
                        Medium
                      </button>
                      <button
                        onClick={() => { setPriority('low'); setShowPriorityDropdown(false); }}
                        className="w-full px-2 py-1 text-white bg-green-500 rounded 
                          hover:opacity-80"
                      >
                        Low
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleFormat('bold')}
                  className="w-6 h-6 text-[#6B7280] hover:text-[#10B981] 
                    transition-all duration-200 hover:scale-105 flex-shrink-0"
                >
                  <Bold className="w-6 h-6" />
                </button>

                <button
                  type="button"
                  onClick={() => handleFormat('italic')}
                  className="w-6 h-6 text-[#6B7280] hover:text-[#10B981] 
                    transition-all duration-200 hover:scale-105 flex-shrink-0"
                >
                  <Italic className="w-6 h-6" />
                </button>

                <button
                  type="button"
                  onClick={handleBulletPoint}
                  className="w-6 h-6 text-[#6B7280] hover:text-[#10B981] 
                    transition-all duration-200 hover:scale-105 flex-shrink-0"
                >
                  <List className="w-6 h-6" />
                </button>
              </div>

              {showAlarmInput && (
                <div className="mt-2">
                  <input
                    type="datetime-local"
                    value={alarm}
                    onChange={(e) => setAlarm(e.target.value)}
                    className="w-full text-sm px-2 py-1 border border-[#E5E7EB] rounded-md
                      focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
              )}

              {showLinkInput && (
                <div className="mt-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="Add a link"
                    className="w-full text-sm px-2 py-1 border border-[#E5E7EB] rounded-md
                      focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
              )}

              {showTagInput && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => handleTagAdd(e.target.value)}
                    placeholder="Add tags (comma-separated)"
                    className="w-full text-sm px-2 py-1 border border-[#E5E7EB] rounded-md
                      focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <button
        onClick={() => setIsAdding(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#10B981] text-white rounded-full 
          shadow-lg hover:bg-[#0A9C6D] transition-colors duration-200 flex items-center 
          justify-center group focus:outline-none focus:ring-2 focus:ring-offset-2 
          focus:ring-[#10B981]"
      >
        <Plus className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
      </button>
    </div>
  );
};

export default TaskList;