import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';
import 'react-confirm-alert/src/react-confirm-alert.css';
import logo from '../assets/task-manager-logo.svg';
import { initRefreshOnLoad } from '../config/tokenManager';
import { useAuth } from '../hooks/useAuth';
import { useTaskActions } from '../hooks/useTaskActions';
import { useAI } from '../hooks/useAI';
import TaskForm from './TaskForm';
import TaskTable from './TaskTable';
import AIChatPanel from './AIChatPanel';
import ImportModal from './ImportModal';

const Dashboard = () => {
  const navigate = useNavigate();

  const { userName, authHeader, handleLogout } = useAuth(navigate);

  const {
    tasks, title, setTitle, description, setDescription,
    status, setStatus, editingId, isSubmitting,
    fetchTasks, resetForm, handleAddOrUpdate, handleEdit, handleDelete,
  } = useTaskActions({ authHeader, navigate });

  const {
    isGenerating, isSuggestingStatus, isBreakingDown, breakdown, setBreakdown,
    generateDescription, suggestStatus, breakdownTask,
    isSummarizing, summary, showSummary, setShowSummary, summarizeTasks,
    showChat, setShowChat, chatMessages, chatInput, setChatInput, isChatting, sendChatMessage,
    showImportModal, setShowImportModal, importFile, setImportFile,
    isImporting, importResult, setImportResult, importDocument,
  } = useAI({ authHeader, fetchTasks, title, description, setDescription, setStatus });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    initRefreshOnLoad();
    fetchTasks();
  }, [navigate, fetchTasks]);

  const handleReset = useCallback(() => {
    resetForm();
    setBreakdown('');
  }, [resetForm, setBreakdown]);

  const handleFormSubmit = useCallback((e) => {
    handleAddOrUpdate(e, () => setBreakdown(''));
  }, [handleAddOrUpdate, setBreakdown]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div>
            <img src={logo} alt="Task Manager" className="dashboard-logo" />
          </div>
          <div className="controls">
            <div className="user-controls">
              <div className="welcome-text">Logged in as {userName}</div>
              <button className="icon-btn" title="Logout" aria-label="Logout" onClick={handleLogout}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 13v-2H7V8l-5 4 5 4v-3h9z" fill="#dc3545"/><path d="M20 3h-8v2h8v14h-8v2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" fill="#dc3545"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="main-content">
          <TaskForm
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            status={status}
            setStatus={setStatus}
            editingId={editingId}
            isSubmitting={isSubmitting}
            onReset={handleReset}
            onSubmit={handleFormSubmit}
            isGenerating={isGenerating}
            generateDescription={generateDescription}
            isSuggestingStatus={isSuggestingStatus}
            suggestStatus={suggestStatus}
            isBreakingDown={isBreakingDown}
            breakdownTask={breakdownTask}
            breakdown={breakdown}
            setBreakdown={setBreakdown}
          />
          <TaskTable
            tasks={tasks}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            isSummarizing={isSummarizing}
            showSummary={showSummary}
            setShowSummary={setShowSummary}
            summary={summary}
            summarizeTasks={summarizeTasks}
            onOpenImport={() => { setShowImportModal(true); setImportFile(null); setImportResult(null); }}
            onOpenChat={() => setShowChat(true)}
          />
        </div>
      </div>

      <ImportModal
        show={showImportModal}
        onClose={() => setShowImportModal(false)}
        importFile={importFile}
        setImportFile={setImportFile}
        importResult={importResult}
        setImportResult={setImportResult}
        isImporting={isImporting}
        importDocument={importDocument}
      />
      <AIChatPanel
        show={showChat}
        onClose={() => setShowChat(false)}
        chatMessages={chatMessages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        isChatting={isChatting}
        sendChatMessage={sendChatMessage}
      />
    </div>
  );
};

export default Dashboard;
