import type { ReactNode } from 'react';
import React, { createContext, useContext, useReducer } from 'react';
import type { BoardState, Action, BoardContextType } from './types';

// Начальные данные
const initialData: BoardState = {
    currentProjectId: 'project-1',
    searchQuery: '',
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
        case 'ADD_PROJECT': {
            const { project } = action.payload;
            return {
                ...state,
                projects: {
                    ...state.projects,
                    [project.id]: project,
                },
                currentProjectId: project.id,
            };
        }
        case 'EDIT_PROJECT': {
            const { projectId, name } = action.payload;
            return {
                ...state,
                projects: {
                    ...state.projects,
                    [projectId]: {
                        ...state.projects[projectId],
                        name: name,
                    },
                },
            };
        }
        case 'DELETE_PROJECT': {
            const { projectId } = action.payload;
            const newProjects = { ...state.projects };
            delete newProjects[projectId];

            // Если удаляем текущий проект, переключаемся на первый доступный или null
            const remainingIds = Object.keys(newProjects);
            let newCurrentId = state.currentProjectId;
            if (state.currentProjectId === projectId) {
                newCurrentId = remainingIds.length > 0 ? remainingIds[0] : null;
            }

            return {
                ...state,
                projects: newProjects,
                currentProjectId: newCurrentId,
            };
        }
        case 'SET_SEARCH_QUERY': {
            return { ...state, searchQuery: action.payload.query };
        }
        case 'SORT_COLUMN': {
            const { projectId, columnId, sortType } = action.payload;
            const project = state.projects[projectId];
            const column = project.columns[columnId];
            const tasks = project.tasks;

            const sortedTaskIds = [...column.taskIds].sort((a, b) => {
                const taskA = tasks[a];
                const taskB = tasks[b];

                if (sortType === 'priority') {
                    const priorityMap = { high: 3, medium: 2, low: 1 };
                    return priorityMap[taskB.priority] - priorityMap[taskA.priority];
                } else if (sortType === 'date') {
                    return new Date(taskB.createdAt).getTime() - new Date(taskA.createdAt).getTime();
                }
                return 0;
            });

            return {
                ...state,
                projects: {
                    ...state.projects,
                    [projectId]: {
                        ...project,
                        columns: {
                            ...project.columns,
                            [columnId]: {
                                ...column,
                                taskIds: sortedTaskIds,
                            },
                        },
                    },
                },
            };
        }
        case 'RENAME_COLUMN': {
            const { projectId, columnId, newTitle } = action.payload;
            const project = state.projects[projectId];

            return {
                ...state,
                projects: {
                    ...state.projects,
                    [projectId]: {
                        ...project,
                        columns: {
                            ...project.columns,
                            [columnId]: {
                                ...project.columns[columnId],
                                title: newTitle
                            }
                        }
                    }
                }
            };
        }
        case 'ADD_COLUMN': {
            const { projectId, title } = action.payload;
            const project = state.projects[projectId];
            const newColumnId = `col-${Date.now()}`;

            return {
                ...state,
                projects: {
                    ...state.projects,
                    [projectId]: {
                        ...project,
                        columns: {
                            ...project.columns,
                            [newColumnId]: {
                                id: newColumnId,
                                title: title,
                                taskIds: []
                            }
                        },
                        columnOrder: [...project.columnOrder, newColumnId]
                    }
                }
            };
        }
        case 'DELETE_COLUMN': {
            const { projectId, columnId } = action.payload;
            const project = state.projects[projectId];

            const newColumnOrder = project.columnOrder.filter(id => id !== columnId);
            const newColumns = { ...project.columns };
            delete newColumns[columnId];

            // Удаляем задачи, связанные с колонкой
            const taskIdsToRemove = new Set(project.columns[columnId].taskIds);
            const newTasks = { ...project.tasks };
            Object.keys(newTasks).forEach(taskId => {
                if (taskIdsToRemove.has(taskId)) {
                    delete newTasks[taskId];
                }
            });

            return {
                ...state,
                projects: {
                    ...state.projects,
                    [projectId]: {
                        ...project,
                        tasks: newTasks,
                        columns: newColumns,
                        columnOrder: newColumnOrder
                    }
                }
            };
        }
        case 'CLEAR_COLUMN': {
            const { projectId, columnId } = action.payload;
            const project = state.projects[projectId];
            const taskIdsToRemove = new Set(project.columns[columnId].taskIds);
            const newTasks = { ...project.tasks };

            // Удаляем задачи, которые находятся в этой колонке
            Object.keys(newTasks).forEach(taskId => {
                if (taskIdsToRemove.has(taskId)) {
                    delete newTasks[taskId];
                }
            });

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
                                ...project.columns[columnId],
                                taskIds: [],
                            },
                        },
                    },
                },
            };
        }
        case 'IMPORT_DATA': {
            const { projects } = action.payload;
            const newCurrentId = Object.keys(projects)[0] || null;
            return {
                ...state,
                projects: projects,
                currentProjectId: newCurrentId,
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

export const useBoard = () => {
    const context = useContext(BoardContext);
    if (!context) {
        throw new Error('useBoard must be used within a BoardProvider');
    }
    return context;
};
