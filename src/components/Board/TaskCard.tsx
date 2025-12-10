import type { Task } from '../../context/types';
import styles from './Board.module.css';
import clsx from 'clsx';
import { Calendar, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBoard } from '../../context/BoardContext';

interface TaskCardProps {
    task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
    const { state, dispatch } = useBoard();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id, data: { type: 'Task', task } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent drag start when clicking delete
        if (!state.currentProjectId) return;

        // Find columnId (expensive search, better to pass columnId prop to TaskCard)
        // For now, let's find it in state
        const project = state.projects[state.currentProjectId];
        const column = Object.values(project.columns).find(col => col.taskIds.includes(task.id));

        if (column) {
            dispatch({
                type: 'DELETE_TASK',
                payload: {
                    projectId: state.currentProjectId,
                    columnId: column.id,
                    taskId: task.id
                }
            });
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`${styles.card} slideUp`}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div className={styles.cardTitle}>{task.title}</div>
                <button
                    onClick={handleDelete}
                    style={{ color: 'var(--color-text-secondary)', opacity: 0.6, cursor: 'pointer', padding: 2 }}
                    title="Удалить"
                >
                    <Trash2 size={14} />
                </button>
            </div>
            {task.description && <div className={styles.cardDescription}>{task.description}</div>}

            <div className={styles.cardFooter}>
                <div className={clsx(styles.priorityTag, styles[task.priority])}>
                    {task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
                    <Calendar size={12} />
                    <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
