import React, { useState, useEffect, useRef } from 'react';
import { AppDocument, Standard, Language } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { backendService } from '@/services/BackendService';
import { SparklesIcon, BoldIcon, ItalicIcon, UnderlineIcon, ListBulletIcon, ListOrderedIcon, XMarkIcon } from '@/components/icons';
import { useTheme } from '@/components/common/ThemeProvider';
import { useToast } from '@/hooks/useToast';

interface DocumentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: AppDocument;
  standards: Standard[];
  onSave: (document: AppDocument) => void;
}

const DocumentEditorModal: React.FC<DocumentEditorModalProps> = ({ isOpen, onClose, document: documentData, standards, onSave }) => {
  const { t, lang, dir } = useTranslation();
  const { theme } = useTheme();
  const toast = useToast();
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (documentData) {
      const initialContent = documentData.content?.[lang] || '';
      setContent(initialContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = initialContent;
      }
      setIsEditing(false);
    }
  }, [documentData, lang, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const updatedContent = editorRef.current?.innerHTML || content;
    const updatedDocument = {
      ...documentData,
      content: { ...documentData.content, [lang]: updatedContent },
    };
    onSave(updatedDocument);
  };
  
  const handleFormat = (command: string) => {
    document.execCommand(command);
    editorRef.current?.focus();
  };

  const handleAiAction = async (action: 'generate' | 'improve' | 'translate') => {
    setIsLoading(true);
    try {
        let textToProcess = content;
        const selection = window.getSelection();
        const isSelection = selection && !selection.isCollapsed && selection.toString().trim().length > 0;
        
        if (isSelection) {
            textToProcess = selection!.toString();
        }

        let newContent = '';
        if (action === 'generate') {
            const standard = standards.find(s => s.standardId === selectedStandard);
            if(standard) newContent = await backendService.generatePolicyFromStandard(standard, lang);
        } else if (action === 'improve') {
            newContent = await backendService.improveWriting(textToProcess, lang);
        } else if (action === 'translate') {
            newContent = await backendService.translateText(textToProcess, lang === 'en' ? 'ar' : 'en');
        }

        if (isSelection && editorRef.current) {
            const range = selection!.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(newContent));
        } else {
            setContent(newContent);
            if(editorRef.current) editorRef.current.innerHTML = newContent;
        }

    } catch(e) {
        console.error("AI Action Failed", e);
        toast.error(t('errorGeneratingContent'));
    } finally {
        setIsLoading(false);
    }
  };

  const Toolbar = () => (
    <div className="flex items-center gap-1 p-2 border-b dark:border-dark-brand-border bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
        <button onClick={() => handleFormat('bold')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Bold"><BoldIcon className="w-5 h-5"/></button>
        <button onClick={() => handleFormat('italic')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Italic"><ItalicIcon className="w-5 h-5"/></button>
        <button onClick={() => handleFormat('underline')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Underline"><UnderlineIcon className="w-5 h-5"/></button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
        <button onClick={() => handleFormat('insertUnorderedList')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Bulleted List"><ListBulletIcon className="w-5 h-5"/></button>
        <button onClick={() => handleFormat('insertOrderedList')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Numbered List"><ListOrderedIcon className="w-5 h-5"/></button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm modal-enter" onClick={onClose}>
      <div className="bg-white dark:bg-dark-brand-surface rounded-lg shadow-xl w-full max-w-4xl h-[90vh] m-4 flex flex-col modal-content-enter" onClick={e => e.stopPropagation()} dir={dir}>
        <div className="p-4 border-b dark:border-dark-brand-border flex justify-between items-center flex-shrink-0">
          <h3 className="text-xl font-semibold dark:text-dark-brand-text-primary">{documentData.name[lang]}</h3>
          <button onClick={onClose} className="p-2 text-gray-500 rounded-full dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b dark:border-dark-brand-border space-y-2 md:space-y-0 md:flex items-center justify-between gap-4 flex-shrink-0">
            <div className='flex flex-wrap items-center gap-2'>
                <select value={selectedStandard} onChange={e => setSelectedStandard(e.target.value)} className="border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-white dark:bg-gray-700 dark:text-white">
                    <option value="">{t('selectStandard')}</option>
                    {standards.map(s => <option key={s.standardId} value={s.standardId}>{s.standardId}</option>)}
                </select>
                <button onClick={() => handleAiAction('generate')} disabled={isLoading || !selectedStandard} className="flex items-center text-sm bg-brand-primary text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"> <SparklesIcon className="w-4 h-4 ltr:mr-1 rtl:ml-1"/> {t('generatePolicy')}</button>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
                <button onClick={() => handleAiAction('improve')} disabled={isLoading || !content} className="flex items-center text-sm bg-gray-600 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 disabled:bg-gray-400"> <SparklesIcon className="w-4 h-4 ltr:mr-1 rtl:ml-1"/> {t('improveWriting')}</button>
                <button onClick={() => handleAiAction('translate')} disabled={isLoading || !content} className="flex items-center text-sm bg-gray-600 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 disabled:bg-gray-400"> {t('translate')}</button>
            </div>
        </div>

        <div className="flex-grow p-4 overflow-y-auto relative">
          {isEditing ? (
            <div className="h-full flex flex-col">
              <Toolbar />
              <div
                ref={editorRef}
                contentEditable={!isLoading}
                onInput={(e) => setContent(e.currentTarget.innerHTML)}
                className={`flex-grow border-x border-b rounded-b-md p-4 prose max-w-none dark:prose-invert focus:outline-none bg-white dark:bg-gray-800 text-brand-text-primary dark:text-dark-brand-text-primary border-gray-300 dark:border-gray-600`}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          ) : (
            <div
              className={`prose max-w-none ${theme === 'dark' ? 'dark-prose' : ''}`}
              dangerouslySetInnerHTML={{ __html: isLoading ? `<p>${t('generating')}...</p>` : content }}
            />
          )}
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-3 flex justify-end items-center space-x-3 rtl:space-x-reverse border-t dark:border-dark-brand-border flex-shrink-0">
          <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white dark:bg-gray-600 py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500"
            >
              {isEditing ? t('viewMode') : t('editMode')}
            </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isEditing}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {t('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditorModal;