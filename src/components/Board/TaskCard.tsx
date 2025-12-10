import type { Task } from '../../context/types';
import styles from './Board.module.css';
import clsx from 'clsx';
import { Calendar } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
    task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={styles.card}
        >
            <div className={styles.cardTitle}>{task.title}</div>
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
