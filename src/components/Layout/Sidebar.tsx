import { Layout, Plus, Edit2, Trash2, Upload, Download } from 'lucide-react';
import styles from './Layout.module.css';
import { useBoard } from '../../context/BoardContext';
import clsx from 'clsx';
import { useState, useRef } from 'react';
import ConfirmModal from '../UI/ConfirmModal';

const Sidebar = () => {
    const { state, dispatch } = useBoard();
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

    const handleCreateProject = () => {
        const newProject = {
            id: `project-${Date.now()}`,
            name: 'Новый проект',
            description: '',
            columns: {
                'col-1': { id: 'col-1', title: 'К выполнению', taskIds: [] },
                'col-2': { id: 'col-2', title: 'В работе', taskIds: [] },
                'col-3': { id: 'col-3', title: 'Готово', taskIds: [] },
            },
            columnOrder: ['col-1', 'col-2', 'col-3'],
            tasks: {}
        };

        dispatch({
            type: 'ADD_PROJECT',
            payload: { project: newProject }
        });

        // Автоматически начинаем редактирование нового проекта
        setEditingProjectId(newProject.id);
        setEditName(newProject.name);
    };

    const startEditing = (e: React.MouseEvent, project: { id: string, name: string }) => {
        e.stopPropagation();
        setEditingProjectId(project.id);
        setEditName(project.name);
    };

    const saveEditing = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (editingProjectId && editName.trim()) {
            dispatch({
                type: 'EDIT_PROJECT',
                payload: { projectId: editingProjectId, name: editName.trim() }
            });
        }
        setEditingProjectId(null);
    };

    const cancelEditing = () => {
        setEditingProjectId(null);
    };

    const requestDelete = (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();
        setDeleteProjectId(projectId);
    };

    const confirmDelete = () => {
        if (deleteProjectId) {
            dispatch({
                type: 'DELETE_PROJECT',
                payload: { projectId: deleteProjectId }
            });
            setDeleteProjectId(null);
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [pendingImport, setPendingImport] = useState<any>(null);
    const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);

    const handleExport = () => {
        const dataStr = JSON.stringify(state.projects, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'taskflow.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const content = event.target?.result as string;
                    const projects = JSON.parse(content);
                    // Простая валидация: проверяем, что это объект
                    if (typeof projects === 'object' && projects !== null) {
                        setPendingImport(projects);
                        setIsImportConfirmOpen(true);
                    } else {
                        alert('Неверный формат файла');
                    }
                } catch (error) {
                    console.error('Import error:', error);
                    alert('Ошибка при чтении файла');
                }
                if (fileInputRef.current) fileInputRef.current.value = '';
            };
            reader.readAsText(file);
        }
    };

    const confirmImport = () => {
        if (pendingImport) {
            dispatch({ type: 'IMPORT_DATA', payload: { projects: pendingImport } });
            setPendingImport(null);
            setIsImportConfirmOpen(false);
        }
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <Layout size={24} style={{ color: 'var(--color-accent)' }} />
                <span>TaskFlow</span>
            </div>

            <div className={styles.projectList}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontWeight: 600, padding: '0 0.5rem' }}>
                    <span>ПРОЕКТЫ</span>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={handleCreateProject} style={{ cursor: 'pointer', color: 'inherit' }} title="Создать проект">
                            <Plus size={16} />
                        </button>
                        <button onClick={handleImportClick} style={{ cursor: 'pointer', color: 'inherit' }} title="Импорт проектов">
                            <Upload size={16} />
                        </button>
                        <button onClick={handleExport} style={{ cursor: 'pointer', color: 'inherit' }} title="Экспорт проектов">
                            <Download size={16} />
                        </button>
                    </div>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".json"
                    onChange={handleFileChange}
                />

                {Object.values(state.projects).map((project) => (
                    <div
                        key={project.id}
                        className={clsx(styles.projectItem, {
                            [styles.active]: state.currentProjectId === project.id,
                        })}
                        onClick={() => dispatch({ type: 'SET_CURRENT_PROJECT', payload: { projectId: project.id } })}
                    >
                        {editingProjectId === project.id ? (
                            <form onSubmit={saveEditing} onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <input
                                    autoFocus
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onBlur={() => saveEditing()}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') cancelEditing();
                                    }}
                                    style={{
                                        border: '1px solid var(--color-accent)',
                                        borderRadius: 'var(--radius-sm)',
                                        padding: '2px 4px',
                                        background: 'var(--color-bg-primary)',
                                        color: 'var(--color-text-primary)',
                                        width: '100%',
                                        fontSize: 'inherit',
                                        outline: 'none'
                                    }}
                                />
                            </form>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flex: 1, minWidth: 0 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: state.currentProjectId === project.id ? 'var(--color-accent)' : 'var(--color-bg-card)', flexShrink: 0 }}></span>
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.name}</span>
                                </div>
                                <div className={styles.projectActions}>
                                    <button
                                        onClick={(e) => startEditing(e, project)}
                                        style={{ color: 'var(--color-text-secondary)', opacity: 0.6, cursor: 'pointer', padding: 2 }}
                                        title="Редактировать"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => requestDelete(e, project.id)}
                                        style={{ color: 'var(--color-text-secondary)', opacity: 0.6, cursor: 'pointer', padding: 2 }}
                                        title="Удалить"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <ConfirmModal
                isOpen={!!deleteProjectId}
                onClose={() => setDeleteProjectId(null)}
                onConfirm={confirmDelete}
                title="Удалить проект?"
                message="Вы уверены, что хотите удалить этот проект? Все задачи в нем будут потеряны безвозвратно."
            />
            <ConfirmModal
                isOpen={isImportConfirmOpen}
                onClose={() => { setIsImportConfirmOpen(false); setPendingImport(null); }}
                onConfirm={confirmImport}
                title="Импортировать данные?"
                message="ВНИМАНИЕ: Это действие ПОЛНОСТЬЮ заменит все текущие проекты и задачи на данные из файла. Это действие нельзя отменить!"
                confirmText="Подтвердить"
            />
        </aside>
    );
};

export default Sidebar;
