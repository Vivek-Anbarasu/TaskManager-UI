const ImportModal = ({ show, onClose, importFile, setImportFile, importResult, setImportResult, isImporting, importDocument }) => {
  if (!show) return null;

  return (
    <div className="chat-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="chat-modal import-modal" role="dialog" aria-label="Import Document">
        <div className="chat-modal-header import-modal-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 16l-4-4h3V4h2v8h3l-4 4z" fill="#b45309"/><path d="M4 20h16v-4h-2v2H6v-2H4v4z" fill="#b45309"/></svg>
          <span>Import Tasks from Document</span>
          <button className="summary-close-btn" onClick={onClose} title="Close">✕</button>
        </div>
        <div className="import-modal-body">
          <p className="import-hint">Upload a PDF, Word, or Excel document (.pdf, .doc, .docx, .xlsx, .xls). The AI will extract tasks and save them automatically.</p>
          <label className="import-drop-zone" htmlFor="import-file-input">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#b45309" strokeWidth="1.5" strokeLinejoin="round"/><path d="M14 2v6h6" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round"/><path d="M12 12v6M9 15l3-3 3 3" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="import-drop-label">
              {importFile ? importFile.name : 'Click to choose a file'}
            </span>
            <span className="import-drop-sub">PDF, DOC, DOCX, XLSX, XLS supported</span>
            <input
              id="import-file-input"
              type="file"
              accept=".pdf,.doc,.docx,.xlsx,.xls"
              className="import-file-input"
              onChange={(e) => { setImportFile(e.target.files[0] || null); setImportResult(null); }}
              aria-label="Choose document file"
            />
          </label>

          {importResult && (
            <div className="import-result">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 11l3 3L22 4" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/></svg>
              <span>{importResult.message}</span>
            </div>
          )}
        </div>
        <div className="import-modal-footer">
          <button
            type="button"
            className="btn secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn ai-import-submit-btn"
            onClick={importDocument}
            disabled={isImporting || !importFile}
          >
            {isImporting ? <><span className="ai-spinner" /> Importing…</> : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
