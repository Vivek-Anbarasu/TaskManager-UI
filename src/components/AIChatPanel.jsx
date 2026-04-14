const AIChatPanel = ({ show, onClose, chatMessages, chatInput, setChatInput, isChatting, sendChatMessage }) => {
  if (!show) return null;

  return (
    <div className="chat-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="chat-modal" role="dialog" aria-label="AI Task Chat">
        <div className="chat-modal-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>AI Task Assistant</span>
          <button className="summary-close-btn" onClick={onClose} title="Close">✕</button>
        </div>
        <div className="chat-messages" aria-live="polite">
          {chatMessages.length === 0 && (
            <p className="chat-placeholder">Ask me anything about your tasks — e.g. "What should I work on next?" or "Are there any blockers?"</p>
          )}
          {chatMessages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              <p className="chat-bubble">{msg.text}</p>
              {msg.role === 'ai' && msg.tasksAnalyzed != null && (
                <span className="chat-meta">{msg.tasksAnalyzed} task{msg.tasksAnalyzed !== 1 ? 's' : ''} analysed</span>
              )}
            </div>
          ))}
          {isChatting && (
            <div className="chat-message ai">
              <p className="chat-bubble chat-typing"><span className="ai-spinner" /></p>
            </div>
          )}
        </div>
        <div className="chat-input-row">
          <input
            className="input chat-input"
            placeholder="Type your question…"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !isChatting) sendChatMessage(); }}
            disabled={isChatting}
            aria-label="Chat input"
          />
          <button
            className="btn ai-chat-send-btn"
            onClick={sendChatMessage}
            disabled={isChatting || !chatInput.trim()}
            title="Send"
          >
            {isChatting ? <span className="ai-spinner" /> : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatPanel;
