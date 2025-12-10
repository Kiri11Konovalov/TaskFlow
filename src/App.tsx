import './styles/global.css';
import { BoardProvider } from './context/BoardContext';
import Sidebar from './components/Layout/Sidebar';
import KanbanBoard from './components/Board/KanbanBoard';
import styles from './components/Layout/Layout.module.css';
import { Settings, User } from 'lucide-react';

const AppContent = () => {
  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>Доска задач</div>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-secondary)' }}>
            <Settings size={20} style={{ cursor: 'pointer' }} />
            <User size={20} style={{ cursor: 'pointer' }} />
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
