import React from 'react';
import './styles/global.css';
import { BoardProvider, useBoard } from './context/BoardContext';

const DebugView = () => {
  const { state } = useBoard();
  return (
    <div style={{ padding: '2rem' }}>
      <h1>TaskFlow</h1>
      <pre style={{ background: '#334155', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem' }}>
        {JSON.stringify(state, null, 2)}
      </pre>
    </div>
  );
};

function App() {
  return (
    <BoardProvider>
      <DebugView />
    </BoardProvider>
  );
}

export default App;
