import { STATUS_OPTIONS } from '../hooks/useTaskActions';

const TaskForm = ({
  title, setTitle,
  description, setDescription,
  status, setStatus,
  editingId,
  isSubmitting,
  onReset,
  onSubmit,
  isGenerating, generateDescription,
  isSuggestingStatus, suggestStatus,
  isBreakingDown, breakdownTask,
  breakdown, setBreakdown,
}) => (
  <form className="task-form" onSubmit={onSubmit} aria-label="task-form">
    <div className="form-row">
      <div className="form-col">
        <label className="field-label">Title</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="form-col">
        <div className="description-label-row">
          <label className="field-label">Status</label>
          <button
            type="button"
            className="btn ai-generate-btn"
            onClick={suggestStatus}
            disabled={isSuggestingStatus}
            title="Suggest status using AI"
          >
            {isSuggestingStatus ? (
              <span className="ai-spinner" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" fill="#fff"/><path d="M19 15l1.09 3.26L23 19l-2.91.74L19 23l-1.09-3.26L15 19l2.91-.74L19 15z" fill="#fff"/></svg>
            )}
            {isSuggestingStatus ? 'Suggesting…' : 'Suggest with AI'}
          </button>
        </div>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>

    <div className="form-group">
      <div className="description-label-row">
        <label className="field-label">Description</label>
        <button
          type="button"
          className="btn ai-generate-btn"
          onClick={generateDescription}
          disabled={isGenerating}
          title="Generate description using AI"
        >
          {isGenerating ? (
            <span className="ai-spinner" />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" fill="#fff"/><path d="M19 15l1.09 3.26L23 19l-2.91.74L19 23l-1.09-3.26L15 19l2.91-.74L19 15z" fill="#fff"/></svg>
          )}
          {isGenerating ? 'Generating…' : 'Generate with AI'}
        </button>
      </div>
      <textarea className="input textarea-description" value={description} onChange={(e) => setDescription(e.target.value)} />
    </div>

    <div className="form-group">
      <button
        type="button"
        className="btn ai-breakdown-btn"
        onClick={breakdownTask}
        disabled={isBreakingDown}
        title="Break this task into actionable subtasks using AI"
      >
        {isBreakingDown ? (
          <span className="ai-spinner" />
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><rect x="9" y="3" width="6" height="4" rx="1" stroke="#fff" strokeWidth="2"/><path d="M9 12h6M9 16h4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
        )}
        {isBreakingDown ? 'Breaking down…' : 'Break Down Task'}
      </button>
    </div>

    {breakdown && (
      <div className="ai-breakdown-panel">
        <div className="ai-breakdown-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="#059669" strokeWidth="2" strokeLinecap="round"/><rect x="9" y="3" width="6" height="4" rx="1" stroke="#059669" strokeWidth="2"/><path d="M9 12h6M9 16h4" stroke="#059669" strokeWidth="2" strokeLinecap="round"/></svg>
          <span>AI Task Breakdown</span>
          <button className="summary-close-btn" onClick={() => setBreakdown('')} title="Close">✕</button>
        </div>
        <div className="ai-breakdown-body">
          {breakdown.split('\n').map((line, i) => (
            line.trim() ? <p key={i} className="breakdown-line">{line}</p> : null
          ))}
        </div>
      </div>
    )}

    <div className="form-actions">
      <button type="submit" className="btn" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : editingId ? 'Update Task' : 'Create Task'}</button>
      <button type="button" className="btn secondary" onClick={onReset}>Reset</button>
    </div>
  </form>
);

export default TaskForm;
