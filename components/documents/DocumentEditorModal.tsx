

import React, { useState, useEffect, useRef } from 'react';
// FIX: Corrected import path for types
import { AppDocument, Standard, Language } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { backendService } from '../../services/BackendService';
import { SparklesIcon, XMarkIcon } from '../icons';
import { useTheme } from '../common/ThemeProvider';
import { useToast } from '../../hooks/useToast';

interface DocumentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: AppDocument;
  standards: Standard[];
  onSave: (document: AppDocument) => void;
}

// A minimal toolbar implementation for the rich text editor.
const Toolbar: React.FC<{ onFormat: (cmd: string) => void }> = ({ onFormat }) => (
    <div className="flex items-center gap-1 p-2 border-b dark:border-dark-brand-border bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
        <button onClick={() => onFormat('bold')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Bold">B</button>
        <button onClick={() => onFormat('italic')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Italic">I</button>
        <button onClick={() => onFormat('underline')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Underline">U</button>
    </div>
);


const DocumentEditorModal: React.FC<DocumentEditorModalProps> = ({ isOpen, onClose, document: documentData, standards, onSave }) => {
  const { t, lang, dir } = useTranslation();
  const { theme } = useTheme();
  const toast = useToast();
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');
  const [viewingVersion, setViewingVersion] = useState<any>(null);

  useEffect(() => {
    if (documentData) {
      const initialContent = documentData.content?.[lang] || '';
      setContent(initialContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = initialContent;
      }
      setIsEditing(false);
      setActiveTab('editor');
      setViewingVersion(null);
    }
  }, [documentData, lang, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const executeSave = () => {
        const updatedContent = editorRef.current?.innerHTML || content;
        const updatedDocument = {
            ...documentData,
            content: { ...documentData.content, [lang]: updatedContent },
        };
        onSave(updatedDocument);
    };

    if (documentData.status === 'Approved') {
        if (window.confirm(t('newVersionPrompt'))) {
            executeSave();
        }
    } else {
        executeSave();
    }
  };
  
  const handleFormat = (command: string) => {
    document.execCommand(command);
    editorRef.current?.focus();
  };

  const handleAiAction = async (action: 'generate' | 'improve' | 'translate') => {
    setIsEditing(true);
    setActiveTab('editor');
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
  
  const mainContent = viewingVersion ? viewingVersion.content[lang] : content;

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

        <div className="flex-grow flex flex-col p-4 overflow-hidden relative">
            <div className="flex border-b mb-2">
                <button onClick={() => setActiveTab('editor')} className={`py-2 px-4 text-sm ${activeTab === 'editor' ? 'border-b-2 border-brand-primary text-brand-primary' : ''}`}>{t('editMode')}</button>
                <button onClick={() => setActiveTab('history')} className={`py-2 px-4 text-sm ${activeTab === 'history' ? 'border-b-2 border-brand-primary text-brand-primary' : ''}`}>{t('versionHistory')}</button>
            </div>
          {activeTab === 'editor' && (isEditing ? (
            <div className="h-full flex flex-col">
              <Toolbar onFormat={handleFormat} />
              <div
                ref={editorRef}
                contentEditable={!isLoading && !viewingVersion}
                onInput={(e) => setContent(e.currentTarget.innerHTML)}
                className={`flex-grow border-x border-b rounded-b-md p-4 prose max-w-none dark:prose-invert focus:outline-none bg-white dark:bg-gray-800 text-brand-text-primary dark:text-dark-brand-text-primary border-gray-300 dark:border-gray-600`}
                dangerouslySetInnerHTML={{ __html: mainContent }}
              />
            </div>
          ) : (
            <div
              className={`prose max-w-none p-4 ${theme === 'dark' ? 'dark-prose' : ''}`}
              dangerouslySetInnerHTML={{ __html: isLoading ? `<p>${t('generating')}...</p>` : mainContent }}
            />
          ))}
          {activeTab === 'history' && (
              <div className="overflow-y-auto">
                  {documentData.versionHistory.map(v => (
                      <div key={v.version} className="p-2 border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                          Version {v.version} - {new Date(v.date).toLocaleString()} by {v.uploadedBy}
                          <button onClick={() => { setViewingVersion(v); setIsEditing(false); setActiveTab('editor'); }} className="ml-4 text-brand-primary text-sm">View</button>
                      </div>
                  ))}
              </div>
          )}
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-3 flex justify-end items-center space-x-3 rtl:space-x-reverse border-t dark:border-dark-brand-border flex-shrink-0">
          <button
              type="button"
              onClick={() => { setIsEditing(!isEditing); setViewingVersion(null); setActiveTab('editor'); }}
              className="bg-white dark:bg-gray-600 py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500"
            >
              {isEditing ? t('viewMode') : t('editMode')}
            </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isEditing || !!viewingVersion}
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