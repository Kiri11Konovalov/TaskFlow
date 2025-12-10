import React from 'react';
import type { Column as ColumnType, Task } from '../../context/types';
import TaskCard from './TaskCard';
import styles from './Board.module.css';
import { MoreHorizontal, Plus } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

interface ColumnProps {
    column: ColumnType;
    tasks: Task[];
}

const Column: React.FC<ColumnProps> = ({ column, tasks }) => {
    const { setNodeRef } = useDroppable({
        id: column.id,
        data: { type: 'Column', column },
    });

    return (
        <div className={styles.column}>
            <div className={styles.columnHeader}>
                <div className={styles.columnTitle}>
                    {column.title}
                    <span className={styles.taskCount}>{tasks.length}</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                    <button style={{ color: 'var(--color-text-secondary)', padding: 4 }}>
                        <Plus size={16} />
                    </button>
                    <button style={{ color: 'var(--color-text-secondary)', padding: 4 }}>
                        <MoreHorizontal size={16} />
                    </button>
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
    );
};

export default Column;
