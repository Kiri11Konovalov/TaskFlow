import type { ReactNode } from 'react';
import React, { createContext, useContext, useReducer } from 'react';
import type { BoardState, Action, BoardContextType } from './types';

// Начальные данные (Initial Data)
const initialData: BoardState = {
    currentProjectId: 'project-1',
    projects: {
        'project-1': {
            id: 'project-1',
            name: 'Разработка TaskFlow',
            description: 'Создание Kanban доски на React',
            tasks: {
                'task-1': { id: 'task-1', title: 'Настройка проекта', description: 'Инициализация Vite + TS', priority: 'high', createdAt: new Date().toISOString() },
                'task-2': { id: 'task-2', title: 'Стилизация', description: 'Добавить CSS переменные', priority: 'medium', createdAt: new Date().toISOString() },
                'task-3': { id: 'task-3', title: 'Context API', description: 'Реализовать стейт менеджмент', priority: 'high', createdAt: new Date().toISOString() },
            },
            columns: {
                'col-1': { id: 'col-1', title: 'К выполнению', taskIds: ['task-1', 'task-2', 'task-3'] },
                'col-2': { id: 'col-2', title: 'В работе', taskIds: [] },
                'col-3': { id: 'col-3', title: 'Готово', taskIds: [] },
            },
            columnOrder: ['col-1', 'col-2', 'col-3'],
        },
    },
};

const BoardContext = createContext<BoardContextType | undefined>(undefined);

const boardReducer = (state: BoardState, action: Action): BoardState => {
    switch (action.type) {
        case 'ADD_TASK': {
            const { projectId, columnId, task } = action.payload;
            const project = state.projects[projectId];

            return {
                ...state,
                projects: {
                    ...state.projects,
                    [projectId]: {
                        ...project,
                        tasks: { ...project.tasks, [task.id]: task },
                        columns: {
                            ...project.columns,
                            [columnId]: {
                                ...project.columns[columnId],
                                taskIds: [...project.columns[columnId].taskIds, task.id],
                            },
                        },
                    },
                },
            };
        }
        case 'MOVE_TASK': {
            const { projectId, sourceColId, destColId, sourceIndex, destIndex, taskId } = action.payload;
            const project = state.projects[projectId];
            const sourceCol = project.columns[sourceColId];
            const destCol = project.columns[destColId];

            const newSourceTaskIds = Array.from(sourceCol.taskIds);
            newSourceTaskIds.splice(sourceIndex, 1);

            if (sourceColId === destColId) {
                newSourceTaskIds.splice(destIndex, 0, taskId);
                return {
                    ...state,
                    projects: {
                        ...state.projects,
                        [projectId]: {
                            ...project,
                            columns: {
                                ...project.columns,
                                [sourceColId]: { ...sourceCol, taskIds: newSourceTaskIds },
                            },
                        },
                    },
                };
            }

            const newDestTaskIds = Array.from(destCol.taskIds);
            newDestTaskIds.splice(destIndex, 0, taskId);

            return {
                ...state,
                projects: {
                    ...state.projects,
                    [projectId]: {
                        ...project,
                        columns: {
                            ...project.columns,
                            [sourceColId]: { ...sourceCol, taskIds: newSourceTaskIds },
                            [destColId]: { ...destCol, taskIds: newDestTaskIds },
                        },
                    },
                },
            };
        }
        case 'SET_CURRENT_PROJECT': {
            return { ...state, currentProjectId: action.payload.projectId };
        }
        case 'DELETE_TASK': {
            const { projectId, columnId, taskId } = action.payload;
            const project = state.projects[projectId];
            const column = project.columns[columnId];
            const newTasks = { ...project.tasks };
            delete newTasks[taskId];

            return {
                ...state,
                projects: {
                    ...state.projects,
                    [projectId]: {
                        ...project,
                        tasks: newTasks,
                        columns: {
                            ...project.columns,
                            [columnId]: {
                                ...column,
                                taskIds: column.taskIds.filter((id) => id !== taskId),
                            },
                        },
                    },
                },
            };
        }
        case 'EDIT_TASK': {
            const { projectId, task } = action.payload;
            const project = state.projects[projectId];

            return {
                ...state,
                projects: {
                    ...state.projects,
                    [projectId]: {
                        ...project,
                        tasks: {
                            ...project.tasks,
                            [task.id]: task,
                        },
                    },
                },
            };
        }
        default:
            return state;
    }
};

const STORAGE_KEY = 'taskflow-storage-v1';

export const BoardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(boardReducer, initialData, (initial) => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : initial;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return initial;
        }
    });

    React.useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

export const useBoard = () => {
    const context = useContext(BoardContext);
    if (!context) {
        throw new Error('useBoard must be used within a BoardProvider');
    }
    return context;
};
