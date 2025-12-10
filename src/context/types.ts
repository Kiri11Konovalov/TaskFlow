export type Priority = 'low' | 'medium' | 'high';

export interface Task {
    id: string;
    title: string;
    description: string;
    priority: Priority;
    createdAt: string;
}

export interface Column {
    id: string;
    title: string; // Название колонки (например, "В работе")
    taskIds: string[];
}

export interface Project {
    id: string;
    name: string;
    description: string;
    columns: { [key: string]: Column };
    columnOrder: string[];
    tasks: { [key: string]: Task };
}

export interface BoardState {
    projects: { [key: string]: Project };
    currentProjectId: string | null;
}

export type Action =
    | { type: 'ADD_TASK'; payload: { projectId: string; columnId: string; task: Task } }
    | { type: 'MOVE_TASK'; payload: { projectId: string; sourceColId: string; destColId: string; sourceIndex: number; destIndex: number; taskId: string } }
    | { type: 'ADD_PROJECT'; payload: { project: Project } }
    | { type: 'SET_CURRENT_PROJECT'; payload: { projectId: string } }
    | { type: 'DELETE_TASK'; payload: { projectId: string; columnId: string; taskId: string } };

export interface BoardContextType {
    state: BoardState;
    dispatch: React.Dispatch<Action>;
}
