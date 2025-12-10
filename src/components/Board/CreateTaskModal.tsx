import React, { useState } from 'react';
import Modal from '../UI/Modal';
import { useBoard } from '../../context/BoardContext';
import type { Priority } from '../../context/types';


interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    columnId: string;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, columnId }) => {
    const { state, dispatch } = useBoard();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !state.currentProjectId) return;

        const newTask = {
            id: `task-${Date.now()}`,
            title,
            description,
            priority,
            createdAt: new Date().toISOString(),
        };

        dispatch({
            type: 'ADD_TASK',
            payload: {
                projectId: state.currentProjectId,
                columnId,
                task: newTask,
            },
        });

        setTitle('');
        setDescription('');
        setPriority('medium');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Новая задача">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Заголовок</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Что нужно сделать?"
                        style={{
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-bg-card)',
                            backgroundColor: 'var(--color-bg-primary)',
                            color: 'var(--color-text-primary)',
                            outline: 'none',
                        }}
                        autoFocus
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Описание</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Добавьте детали..."
                        rows={3}
                        style={{
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-bg-card)',
                            backgroundColor: 'var(--color-bg-primary)',
                            color: 'var(--color-text-primary)',
                            outline: 'none',
                            resize: 'vertical',
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Приоритет</label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as Priority)}
                        style={{
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-bg-card)',
                            backgroundColor: 'var(--color-bg-primary)',
                            color: 'var(--color-text-primary)',
                            outline: 'none',
                        }}
                    >
                        <option value="low">Низкий</option>
                        <option value="medium">Средний</option>
                        <option value="high">Высокий</option>
                    </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-text-secondary)',
                            cursor: 'pointer',
                        }}
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        disabled={!title.trim()}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--color-accent)',
                            color: 'white',
                            fontWeight: 500,
                            cursor: title.trim() ? 'pointer' : 'not-allowed',
                            opacity: title.trim() ? 1 : 0.5,
                        }}
                    >
                        Создать задачу
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateTaskModal;
