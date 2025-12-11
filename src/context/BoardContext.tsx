import type { ReactNode } from 'react';
import React, { createContext, useContext, useReducer } from 'react';
import type { BoardContextType } from './types';
import { boardReducer, initialData } from './boardReducer';

const BoardContext = createContext<BoardContextType | undefined>(undefined);

const STORAGE_KEY = 'taskflow-storage-v1';

export const BoardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(boardReducer, initialData, (initial) => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? { ...JSON.parse(stored), searchQuery: '' } : initial;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return initial;
        }
    });

    React.useEffect(() => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { searchQuery, ...stateToSave } = state;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }, [state]);

    return (
        <BoardContext.Provider value={{ state, dispatch }}>
            {children}
        </BoardContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBoard = () => {
    const context = useContext(BoardContext);
    if (!context) {
        throw new Error('useBoard must be used within a BoardProvider');
    }
    return context;
};
