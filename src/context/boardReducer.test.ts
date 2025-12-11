import { describe, it, expect } from 'vitest';
import { boardReducer, initialData } from './boardReducer';
import type { BoardState, Task, Project } from './types';

// Вспомогательная функция для создания чистого состояния
const createInitialState = (): BoardState => JSON.parse(JSON.stringify(initialData));

describe('Бизнес-логика: Board Reducer', () => {

    it('должен корректно добавлять новый проект', () => {
        const initialState = createInitialState();
        const newProject: Project = {
            id: 'proj-new',
            name: 'Тестовый проект',
            description: 'Описание',
            columns: {
                'col-1': { id: 'col-1', title: 'Todo', taskIds: [] }
            },
            columnOrder: ['col-1'],
            tasks: {}
        };

        const newState = boardReducer(initialState, {
            type: 'ADD_PROJECT',
            payload: { project: newProject }
        });

        expect(newState.projects['proj-new']).toBeDefined();
        expect(newState.projects['proj-new'].name).toBe('Тестовый проект');
        expect(newState.currentProjectId).toBe('proj-new'); // Должен переключаться на новый проект
    });

    it('должен переименовывать проект', () => {
        const initialState = createInitialState();
        const projectId = 'project-1';
        const newName = 'Обновленное имя';

        const newState = boardReducer(initialState, {
            type: 'EDIT_PROJECT',
            payload: { projectId, name: newName }
        });

        expect(newState.projects[projectId].name).toBe(newName);
    });

    it('должен удалять проект и переключаться на другой', () => {
        const initialState = createInitialState();
        // Добавим второй проект, чтобы было куда переключаться
        const stateWithTwoProjects = boardReducer(initialState, {
            type: 'ADD_PROJECT',
            payload: {
                project: {
                    id: 'proj-2',
                    name: 'Project 2',
                    description: '',
                    columns: {},
                    columnOrder: [],
                    tasks: {}
                }
            }
        });

        // Убедимся, что мы на proj-2
        expect(stateWithTwoProjects.currentProjectId).toBe('proj-2');

        // Удаляем proj-2
        const finalState = boardReducer(stateWithTwoProjects, {
            type: 'DELETE_PROJECT',
            payload: { projectId: 'proj-2' }
        });

        expect(finalState.projects['proj-2']).toBeUndefined();
        // Должен был переключиться обратно на project-1 (или первый доступный)
        expect(finalState.currentProjectId).toBe('project-1');
    });

    it('должен добавлять задачу в колонку', () => {
        const initialState = createInitialState();
        const projectId = 'project-1';
        const columnId = 'col-1';
        const newTask: Task = {
            id: 'task-new',
            title: 'Новая задача',
            description: 'Описание',
            priority: 'medium',
            createdAt: '2023-01-01'
        };

        const newState = boardReducer(initialState, {
            type: 'ADD_TASK',
            payload: { projectId, columnId, task: newTask }
        });

        const project = newState.projects[projectId];
        expect(project.tasks['task-new']).toEqual(newTask);
        expect(project.columns[columnId].taskIds).toContain('task-new');
    });

    it('должен редактировать задачу', () => {
        const initialState = createInitialState();
        const projectId = 'project-1';
        const taskId = 'task-1'; // Существующая задача
        const originalTask = initialState.projects[projectId].tasks[taskId];

        const updatedTask: Task = {
            ...originalTask,
            title: 'Измененный заголовок',
            priority: 'high'
        };

        const newState = boardReducer(initialState, {
            type: 'EDIT_TASK',
            payload: { projectId, task: updatedTask }
        });

        expect(newState.projects[projectId].tasks[taskId].title).toBe('Измененный заголовок');
        expect(newState.projects[projectId].tasks[taskId].priority).toBe('high');
    });

    it('должен удалять задачу из списка задач и из колонки', () => {
        const initialState = createInitialState();
        const projectId = 'project-1';
        const columnId = 'col-1';
        const taskId = 'task-1';

        const newState = boardReducer(initialState, {
            type: 'DELETE_TASK',
            payload: { projectId, columnId, taskId }
        });

        expect(newState.projects[projectId].tasks[taskId]).toBeUndefined();
        expect(newState.projects[projectId].columns[columnId].taskIds).not.toContain(taskId);
    });

    it('должен перемещать задачу внутри одной колонки (изменение порядка)', () => {
        const initialState = createInitialState();
        const projectId = 'project-1';
        const columnId = 'col-1';
        // Исходный порядок в col-1: ['task-1', 'task-2', 'task-3']

        const newState = boardReducer(initialState, {
            type: 'MOVE_TASK',
            payload: {
                projectId,
                sourceColId: columnId,
                destColId: columnId,
                sourceIndex: 0, // перемещаем task-1
                destIndex: 2,   // в конец
                taskId: 'task-1'
            }
        });

        const newOrder = newState.projects[projectId].columns[columnId].taskIds;
        expect(newOrder).toEqual(['task-2', 'task-3', 'task-1']);
    });

    it('должен перемещать задачу между разными колонками', () => {
        const initialState = createInitialState();
        const projectId = 'project-1';
        const sourceColId = 'col-1'; // ['task-1', 'task-2', 'task-3']
        const destColId = 'col-2';   // []

        const newState = boardReducer(initialState, {
            type: 'MOVE_TASK',
            payload: {
                projectId,
                sourceColId,
                destColId,
                sourceIndex: 0, // берем task-1
                destIndex: 0,   // кладем в начало col-2
                taskId: 'task-1'
            }
        });

        const project = newState.projects[projectId];
        expect(project.columns[sourceColId].taskIds).not.toContain('task-1');
        expect(project.columns[destColId].taskIds).toContain('task-1');
        expect(project.columns[destColId].taskIds.length).toBe(1);
    });

    it('должен полностью замещать состояние при импорте', () => {
        const initialState = createInitialState();
        const importedProjects = {
            'imported-proj': {
                id: 'imported-proj',
                name: 'Импортированный проект',
                description: '',
                columns: {},
                columnOrder: [],
                tasks: {}
            }
        };

        const newState = boardReducer(initialState, {
            type: 'IMPORT_DATA',
            payload: { projects: importedProjects }
        });

        expect(Object.keys(newState.projects).length).toBe(1);
        expect(newState.projects['imported-proj']).toBeDefined();
        expect(newState.currentProjectId).toBe('imported-proj');
    });

    it('должен добавлять новую колонку', () => {
        const initialState = createInitialState();
        const projectId = 'project-1';

        const newState = boardReducer(initialState, {
            type: 'ADD_COLUMN',
            payload: { projectId, title: 'Новая колонка' }
        });

        const project = newState.projects[projectId];
        const newColId = project.columnOrder[project.columnOrder.length - 1]; // Последняя добавленная

        expect(project.columns[newColId]).toBeDefined();
        expect(project.columns[newColId].title).toBe('Новая колонка');
    });

    it('должен удалять колонку и связанные задачи', () => {
        const initialState = createInitialState();
        const projectId = 'project-1';
        const columnId = 'col-1'; // Содержит task-1, task-2, task-3

        const newState = boardReducer(initialState, {
            type: 'DELETE_COLUMN',
            payload: { projectId, columnId }
        });

        const project = newState.projects[projectId];
        expect(project.columns[columnId]).toBeUndefined();
        expect(project.columnOrder).not.toContain(columnId);

        // Проверяем, что задачи тоже удалились
        expect(project.tasks['task-1']).toBeUndefined();
        expect(project.tasks['task-2']).toBeUndefined();
        expect(project.tasks['task-3']).toBeUndefined();
    });
});
