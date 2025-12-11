import React, { useState } from 'react';
import type { Column as ColumnType, Task } from '../../context/types';
import TaskCard from './TaskCard';
import styles from './Board.module.css';
import { MoreHorizontal, Plus } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import TaskModal from './TaskModal';
import ConfirmModal from '../UI/ConfirmModal';

import { useBoard } from '../../context/BoardContext';
import { ArrowDown, Calendar, Trash2, Edit2, Eraser } from 'lucide-react';

interface ColumnProps {
    column: ColumnType;
    tasks: Task[];
    projectId: string; // We need projectId for dispatch
}

const Column: React.FC<ColumnProps> = ({ column, tasks, projectId }) => {
    const { dispatch } = useBoard();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [titleInput, setTitleInput] = useState(column.title);

    const { setNodeRef } = useDroppable({
        id: column.id,
        data: { type: 'Column', column },
    });

    const handleSort = (type: 'priority' | 'date') => {
        dispatch({ type: 'SORT_COLUMN', payload: { projectId, columnId: column.id, sortType: type } });
        setIsMenuOpen(false);
    };

    const handleClear = () => {
        setIsClearConfirmOpen(true);
        setIsMenuOpen(false);
    };

    const handleDelete = () => {
        setIsDeleteConfirmOpen(true);
        setIsMenuOpen(false);
    };

    const handleRenameStart = () => {
        setTitleInput(column.title);
        setIsEditing(true);
        setIsMenuOpen(false);
    };

    const handleRenameSubmit = () => {
        if (titleInput.trim() && titleInput !== column.title) {
            dispatch({ type: 'RENAME_COLUMN', payload: { projectId, columnId: column.id, newTitle: titleInput.trim() } });
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRenameSubmit();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setTitleInput(column.title);
        }
    };

    const confirmClear = () => {
        dispatch({ type: 'CLEAR_COLUMN', payload: { projectId, columnId: column.id } });
        setIsClearConfirmOpen(false);
    };

    const confirmDelete = () => {
        dispatch({ type: 'DELETE_COLUMN', payload: { projectId, columnId: column.id } });
        setIsDeleteConfirmOpen(false);
    };

    return (
        <>
            <div className={`${styles.column} fadeIn`}>
                <div className={styles.columnHeader}>
                    <div className={styles.columnTitle} style={{ flex: 1 }}>
                        {isEditing ? (
                            <input
                                autoFocus
                                value={titleInput}
                                onChange={(e) => setTitleInput(e.target.value)}
                                onBlur={handleRenameSubmit}
                                onKeyDown={handleKeyDown}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    width: '100%',
                                    padding: '4px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--color-accent)',
                                    background: 'var(--color-bg-primary)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    outline: 'none'
                                }}
                            />
                        ) : (
                            <>
                                {column.title}
                                <span className={styles.taskCount}>{tasks.length}</span>
                            </>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {!isEditing && (
                            <>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    style={{ color: 'var(--color-text-secondary)', padding: 4, cursor: 'pointer' }}
                                    title="Добавить задачу"
                                >
                                    <Plus size={16} />
                                </button>

                                <div className={styles.menuContainer}>
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        style={{ color: isMenuOpen ? 'var(--color-accent)' : 'var(--color-text-secondary)', padding: 4, cursor: 'pointer' }}
                                        title="Меню колонки"
                                    >
                                        <MoreHorizontal size={16} />
                                    </button>

                                    {isMenuOpen && (
                                        <>
                                            <div
                                                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
                                                onClick={() => setIsMenuOpen(false)}
                                            />
                                            <div className={styles.dropdownMenu}>
                                                <div className={styles.menuItem} onClick={() => handleSort('priority')}>
                                                    <ArrowDown size={14} />
                                                    По приоритету
                                                </div>
                                                <div className={styles.menuItem} onClick={() => handleSort('date')}>
                                                    <Calendar size={14} />
                                                    Сначала новые
                                                </div>
                                                <div className={styles.menuItem} onClick={handleRenameStart}>
                                                    <Edit2 size={14} />
                                                    Переименовать
                                                </div>
                                                <div className={`${styles.menuItem} ${styles.danger}`} onClick={handleClear}>
                                                    <Eraser size={14} />
                                                    Очистить
                                                </div>
                                                <div className={`${styles.menuItem} ${styles.danger}`} onClick={handleDelete}>
                                                    <Trash2 size={14} />
                                                    Удалить
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className={styles.taskList} ref={setNodeRef}>
                    <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                        {tasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </SortableContext>
                </div>
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                columnId={column.id}
            />

            <ConfirmModal
                isOpen={isClearConfirmOpen}
                onClose={() => setIsClearConfirmOpen(false)}
                onConfirm={confirmClear}
                title="Очистить колонку"
                message="Вы уверены, что хотите удалить все задачи из этой колонки? Это действие нельзя отменить."
            />

            <ConfirmModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Удалить колонку"
                message="Вы уверены, что хотите удалить эту колонку и ВСЕ задачи в ней? Это действие нельзя отменить."
            />
        </>
    );
};

export default Column;
