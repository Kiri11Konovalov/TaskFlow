import { useState } from 'react';
import './styles/global.css';
import { BoardProvider } from './context/BoardContext';
import Sidebar from './components/Layout/Sidebar';
import KanbanBoard from './components/Board/KanbanBoard';
import styles from './components/Layout/Layout.module.css';
import { Search, X, Plus } from 'lucide-react';
import { useBoard } from './context/BoardContext';

const AppContent = () => {
  const { state, dispatch } = useBoard();
  const [showSearch, setShowSearch] = useState(false);

  const handleBlur = () => {
    if (!state.searchQuery.trim()) {
      setShowSearch(false);
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            {state.currentProjectId && state.projects[state.currentProjectId]
              ? state.projects[state.currentProjectId].name
              : 'Задачи'}
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            {showSearch ? (
              <div className="fadeIn" style={{ flex: 1, paddingLeft: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: '600px' }}>
                  <Search size={18} style={{ position: 'absolute', left: '10px', color: 'var(--color-text-secondary)' }} />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Поиск"
                    value={state.searchQuery}
                    onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: { query: e.target.value } })}
                    onBlur={handleBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        dispatch({ type: 'SET_SEARCH_QUERY', payload: { query: '' } });
                        setShowSearch(false);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '0.6rem 2.5rem 0.6rem 2.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-accent)',
                      background: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-primary)',
                      fontSize: '1rem',
                      outline: 'none',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  />
                  {state.searchQuery && (
                    <X
                      size={16}
                      style={{ position: 'absolute', right: '10px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
                      onClick={() => {
                        dispatch({ type: 'SET_SEARCH_QUERY', payload: { query: '' } });
                      }}
                      onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking X
                    />
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                style={{
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-secondary)',
                  marginLeft: 'auto'
                }}
                title="Поиск"
              >
                <Search size={20} />
              </button>
            )}

            <div style={{ width: '1px', height: '20px', background: 'var(--color-border)', margin: '0 12px' }} />

            <button
              onClick={() => {
                const project = state.currentProjectId ? state.projects[state.currentProjectId] : null;
                if (project) {
                  dispatch({ type: 'ADD_COLUMN', payload: { projectId: project.id, title: 'Новая колонка' } });
                }
              }}
              style={{
                cursor: 'pointer',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                color: 'var(--color-text-primary)',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 500,
                flexShrink: 0
              }}
              title="Добавить колонку"
            >
              <Plus size={16} />
              Добавить колонку
            </button>
          </div>
        </header>
        <KanbanBoard />
      </main>
    </div>
  );
};

function App() {
  return (
    <BoardProvider>
      <AppContent />
    </BoardProvider>
  );
}

export default App;
