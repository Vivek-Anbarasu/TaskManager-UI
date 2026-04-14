import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AI_BASE } from '../config/api';

const AI_STATUS_MAP = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  BLOCKED: 'Blocked',
};

export function useAI({ authHeader, fetchTasks, title, description, setDescription, setStatus }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggestingStatus, setIsSuggestingStatus] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [breakdown, setBreakdown] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const generateDescription = async () => {
    if (!title.trim()) {
      toast.error('Please enter a task title first.');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await axios.post(
        `${AI_BASE()}/generate-description`,
        { title },
        { headers: { ...authHeader(), 'Content-Type': 'application/json' } }
      );
      setDescription(res.data);
      toast.success('Description generated!');
    } catch {
      toast.error('Failed to generate description. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestStatus = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Please enter a title and description first.');
      return;
    }
    setIsSuggestingStatus(true);
    try {
      const res = await axios.post(
        `${AI_BASE()}/suggest-status`,
        { title, description },
        { headers: { ...authHeader(), 'Content-Type': 'application/json' } }
      );
      const parsed = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
      const mappedStatus = AI_STATUS_MAP[parsed.status];
      if (mappedStatus) {
        setStatus(mappedStatus);
        toast.success(`Status suggested: ${mappedStatus}`);
      } else {
        toast.info(`AI returned an unrecognised status: ${parsed.status}`);
      }
    } catch {
      toast.error('Failed to suggest status. Please try again.');
    } finally {
      setIsSuggestingStatus(false);
    }
  };

  const breakdownTask = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Please enter a title and description first.');
      return;
    }
    setIsBreakingDown(true);
    setBreakdown('');
    try {
      const res = await axios.post(
        `${AI_BASE()}/breakdown`,
        { title, description },
        { headers: { ...authHeader(), 'Content-Type': 'application/json' } }
      );
      setBreakdown(res.data);
    } catch {
      toast.error('Failed to break down task. Please try again.');
    } finally {
      setIsBreakingDown(false);
    }
  };

  const summarizeTasks = async () => {
    if (showSummary) {
      setShowSummary(false);
      return;
    }
    setIsSummarizing(true);
    try {
      const res = await axios.get(
        `${AI_BASE()}/summarize`,
        { headers: authHeader() }
      );
      setSummary(res.data);
      setShowSummary(true);
    } catch {
      toast.error('Failed to summarize tasks. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const sendChatMessage = async () => {
    const message = chatInput.trim();
    if (!message) return;
    setChatMessages((prev) => [...prev, { role: 'user', text: message }]);
    setChatInput('');
    setIsChatting(true);
    try {
      const res = await axios.post(
        `${AI_BASE()}/chat`,
        { message },
        { headers: { ...authHeader(), 'Content-Type': 'application/json' } }
      );
      const { reply, tasksAnalyzed } = res.data;
      setChatMessages((prev) => [...prev, { role: 'ai', text: reply, tasksAnalyzed }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: 'ai', text: 'Sorry, I could not process your question. Please try again.' }]);
    } finally {
      setIsChatting(false);
    }
  };

  const importDocument = async () => {
    if (!importFile) {
      toast.error('Please select a file to import.');
      return;
    }
    setIsImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      const res = await axios.post(
        `${AI_BASE()}/import-document`,
        formData,
        { headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' } }
      );
      setImportResult(res.data);
      await fetchTasks();
    } catch {
      toast.error('Failed to import document. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return {
    isGenerating, isSuggestingStatus, isBreakingDown, breakdown, setBreakdown,
    generateDescription, suggestStatus, breakdownTask,
    isSummarizing, summary, showSummary, setShowSummary, summarizeTasks,
    showChat, setShowChat, chatMessages, chatInput, setChatInput, isChatting, sendChatMessage,
    showImportModal, setShowImportModal, importFile, setImportFile,
    isImporting, importResult, setImportResult, importDocument,
  };
}
