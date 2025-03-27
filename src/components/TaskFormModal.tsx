import React, { useRef, useEffect } from 'react';
import { Clock, Link as LinkIcon, Bold, Italic, List, Tag, Flag, Check } from 'lucide-react';
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

interface TaskFormModalProps {
  isOpen: boolean;
  editingTask: Task | null;
  onClose: () => void;
  onSubmit: (taskData: Partial<Task>) => void;
}

const defaultTags = [
  // Life Areas
  'Work', 'Personal', 'Family', 'Health', 'Finance', 'Education', 'Social', 'Home', 'Travel', 'Shopping',
  // Time Management
  'Today', 'This Week', 'This Month', 'Urgent', 'Later', 'Scheduled',
  // Project Types
  'Planning', 'Research', 'Review', 'Follow-up', 'Meeting', 'Deadline'
];

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  editingTask,
  onClose,
  onSubmit,
}) => {
  const [showAlarmInput, setShowAlarmInput] = React.useState(false);
  const [showLinkInput, setShowLinkInput] = React.useState(false);
  const [showTagDropdown, setShowTagDropdown] = React.useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = React.useState(false);
  const [alarm, setAlarm] = React.useState('');
  const [link, setLink] = React.useState('');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [newTag, setNewTag] = React.useState('');
  const [priority, setPriority] = React.useState<'high' | 'medium' | 'low' | undefined>();
  const [isBold, setIsBold] = React.useState(false);
  const [isItalic, setIsItalic] = React.useState(false);
  const [isList, setIsList] = React.useState(false);
  const titleRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingTask) {
      if (titleRef.current) {
        titleRef.current.textContent = editingTask.title || '';
        titleRef.current.dataset.placeholder = editingTask.title ? '' : 'Title Here...';
      }
      if (descriptionRef.current) {
        descriptionRef.current.innerHTML = editingTask.text || '';
        descriptionRef.current.dataset.placeholder = editingTask.text ? '' : 'Task description here...';
        
        // Check initial formatting states
        setIsBold(document.queryCommandState('bold'));
        setIsItalic(document.queryCommandState('italic'));
        setIsList(document.queryCommandState('insertUnorderedList'));
      }
      setAlarm(editingTask.alarm || '');
      setLink(editingTask.link || '');
      setSelectedTags(editingTask.tags || []);
      setPriority(editingTask.priority);
    } else {
      resetForm();
    }
  }, [editingTask, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target) return;
      
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target as Node)) {
        setShowPriorityDropdown(false);
      }

      const isClickingToolbar = (event.target as Element).closest('.toolbar-section');
      if (!isClickingToolbar) {
        setShowAlarmInput(false);
        setShowLinkInput(false);
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add selection change listener to update formatting states
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        if (descriptionRef.current?.contains(container)) {
          setIsBold(document.queryCommandState('bold'));
          setIsItalic(document.queryCommandState('italic'));
          setIsList(document.queryCommandState('insertUnorderedList'));
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const resetForm = () => {
    if (titleRef.current) titleRef.current.textContent = '';
    if (descriptionRef.current) descriptionRef.current.innerHTML = '';
    setAlarm('');
    setLink('');
    setSelectedTags([]);
    setPriority(undefined);
    setShowAlarmInput(false);
    setShowLinkInput(false);
    setShowTagDropdown(false);
    setShowPriorityDropdown(false);
    setNewTag('');
  };

  const handleSubmit = () => {
    const title = titleRef.current?.textContent || '';
    const description = descriptionRef.current?.innerHTML || '';
    
    if (description) {
      const taskData: Partial<Task> = {
        text: description,
        title: title || undefined,
        alarm: alarm || undefined,
        link: link || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        priority,
      };

      console.log('Submitting task data:', taskData);
      onSubmit(taskData);
      resetForm();
      onClose();
    }
  };

  const handleFormat = (command: string) => {
    if (!descriptionRef.current) return;
    document.execCommand(command, false);
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      if (command === 'bold') setIsBold(document.queryCommandState('bold'));
      if (command === 'italic') setIsItalic(document.queryCommandState('italic'));
    }
    
    descriptionRef.current.focus();
  };

  const handleBulletPoint = () => {
    if (!descriptionRef.current) return;
    document.execCommand('insertUnorderedList', false);
    setIsList(document.queryCommandState('insertUnorderedList'));
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const listItem = (range.commonAncestorContainer as Element).closest('li');
      if (listItem) {
        listItem.classList.add('list-disc', 'ml-4', 'text-[#6B7280]');
      }
    }
    descriptionRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        e.preventDefault();
        document.execCommand('insertLineBreak', false);
      } else if (e.target instanceof HTMLElement) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const listItem = (range.commonAncestorContainer as Element).closest('li');
          
          if (listItem) {
            e.preventDefault();
            if (listItem.textContent?.trim() === '') {
              document.execCommand('outdent', false);
            } else {
              document.execCommand('insertLineBreak', false);
              document.execCommand('insertUnorderedList', false);
            }
          } else {
            e.preventDefault();
            document.execCommand('insertLineBreak', false);
          }
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        document.execCommand('outdent', false);
      } else {
        document.execCommand('indent', false);
      }
    }
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      }
      return [...prev, tag];
    });
  };

  const handleAddNewTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
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

  const getPriorityBgColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#2C5A99] bg-opacity-10 backdrop-blur-md z-40"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
        bg-white/95 p-4 sm:p-6 rounded-2xl
        shadow-[0_0_50px_0_rgba(44,90,153,0.1),0_8px_24px_-4px_rgba(44,90,153,0.15)] 
        border border-white/50 backdrop-blur-sm
        max-w-[90vw] w-full max-h-[80vh] overflow-y-auto max-w-lg z-50"
      >
        <div
          ref={titleRef}
          contentEditable
          className="text-lg sm:text-xl font-semibold text-[#2C5A99] w-full px-3 py-2 
            border-b border-[#F1F2FD] focus:outline-none rounded-t-lg
            empty:before:content-[attr(data-placeholder)] empty:before:text-[#698AAF]/70"
          data-placeholder="Title Here..."
        />
        
        <div
          ref={descriptionRef}
          contentEditable
          className="text-sm sm:text-base font-normal text-[#2C5A99] w-full px-3 py-2 
            border-b border-[#F1F2FD] focus:outline-none min-h-[80px] sm:min-h-[100px]
            empty:before:content-[attr(data-placeholder)] empty:before:text-[#698AAF]/70
            [&>ul]:list-disc [&>ul]:ml-4 [&>ul>li]:text-[#698AAF]"
          data-placeholder="Task description here..."
          onKeyDown={handleKeyDown}
        />

        <div className="bg-[#F1F2FD]/50 p-3 rounded-xl border border-white mt-4 toolbar-section backdrop-blur-sm">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-1">
              <button
                type="button"
                onClick={() => setShowAlarmInput(!showAlarmInput)}
                className={`p-2 rounded-lg text-[#2C5A99] transition-all duration-200 
                  hover:bg-white/80 hover:shadow-md active:scale-95
                  ${showAlarmInput ? 'bg-white shadow-md ring-2 ring-[#4CADCB]/20' : ''}`}
                title="Set alarm"
              >
                <Clock className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setShowLinkInput(!showLinkInput)}
                className={`p-2 rounded-lg text-[#2C5A99] transition-all duration-200 
                  hover:bg-white/80 hover:shadow-md active:scale-95
                  ${showLinkInput ? 'bg-white shadow-md ring-2 ring-[#4CADCB]/20' : ''}`}
                title="Add link"
              >
                <LinkIcon className="w-5 h-5" />
              </button>

              <div className="relative" ref={tagDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                  className={`p-2 rounded-lg text-[#2C5A99] transition-all duration-200 
                    hover:bg-white/80 hover:shadow-md active:scale-95
                    ${showTagDropdown || selectedTags.length > 0 ? 'bg-white shadow-md ring-2 ring-[#4CADCB]/20' : ''}`}
                  title="Add tags"
                >
                  <Tag className="w-5 h-5" />
                </button>
                {showTagDropdown && (
                  <div className="absolute top-full left-0 mt-2 bg-white/95 rounded-xl 
                    shadow-[0_8px_24px_-4px_rgba(44,90,153,0.15)] 
                    border border-white/50 backdrop-blur-sm p-3 z-[9999] min-w-[250px]"
                  >
                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedTags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-[#E8F0FE] text-[#2C5A99] rounded-full text-sm flex items-center gap-1"
                          >
                            {tag}
                            <button
                              onClick={() => handleTagSelect(tag)}
                              className="hover:text-red-500"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    
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
                    </div>

                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {defaultTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleTagSelect(tag)}
                          className={`w-full px-3 py-1.5 text-sm rounded-lg flex items-center justify-between
                            ${selectedTags.includes(tag) 
                              ? 'bg-[#E8F0FE] text-[#2C5A99]' 
                              : 'text-[#2C5A99] hover:bg-[#F1F2FD]/50'}`}
                        >
                          <span>{tag}</span>
                          {selectedTags.includes(tag) && (
                            <Check className="w-4 h-4 text-[#4CADCB]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-6 w-px bg-[#F1F2FD] mx-1" />

              <button
                type="button"
                onClick={() => handleFormat('bold')}
                className={`p-2 rounded-lg text-[#2C5A99] transition-all duration-200 
                  hover:bg-white/80 hover:shadow-md active:scale-95
                  ${isBold ? 'bg-white shadow-md ring-2 ring-[#4CADCB]/20' : ''}`}
                title="Bold"
              >
                <Bold className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => handleFormat('italic')}
                className={`p-2 rounded-lg text-[#2C5A99] transition-all duration-200 
                  hover:bg-white/80 hover:shadow-md active:scale-95
                  ${isItalic ? 'bg-white shadow-md ring-2 ring-[#4CADCB]/20' : ''}`}
                title="Italic"
              >
                <Italic className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleBulletPoint}
                className={`p-2 rounded-lg text-[#2C5A99] transition-all duration-200 
                  hover:bg-white/80 hover:shadow-md active:scale-95
                  ${isList ? 'bg-white shadow-md ring-2 ring-[#4CADCB]/20' : ''}`}
                title="Bullet list"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {showAlarmInput && (
            <div className="mt-3">
              <input
                type="datetime-local"
                value={alarm}
                onChange={(e) => setAlarm(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-white rounded-lg bg-white/80
                  focus:outline-none focus:ring-2 focus:ring-[#4CADCB]/20 focus:border-transparent
                  text-[#2C5A99] shadow-sm backdrop-blur-sm"
              />
            </div>
          )}

          {showLinkInput && (
            <div className="mt-3">
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Add a link"
                className="w-full text-sm px-3 py-2 border border-white rounded-lg bg-white/80
                  focus:outline-none focus:ring-2 focus:ring-[#4CADCB]/20 focus:border-transparent
                  text-[#2C5A99] placeholder-[#698AAF]/70 shadow-sm backdrop-blur-sm"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[#2C5A99] bg-[#F1F2FD]/50 rounded-lg border border-white
              hover:bg-white/80 transition-all duration-200 active:scale-95 shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-gradient-to-r from-[#4CADCB] to-[#2C5A99] text-white rounded-lg 
              hover:shadow-lg hover:shadow-[#4CADCB]/10 transition-all duration-200 active:scale-95
              shadow-md shadow-[#4CADCB]/5"
          >
            {editingTask ? 'Update' : 'Add'}
          </button>
        </div>
      </div>
    </>
  );
};

export default TaskFormModal; 