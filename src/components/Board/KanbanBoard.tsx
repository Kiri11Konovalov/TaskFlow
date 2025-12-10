import { useBoard } from '../../context/BoardContext';
import Column from './Column';
import styles from './Board.module.css';

const KanbanBoard = () => {
    const { state } = useBoard();
    const project = state.currentProjectId ? state.projects[state.currentProjectId] : null;

    if (!project) {
        return <div className={styles.boardContainer}>Выберите проект</div>;
    }

    return (
        <div className={styles.boardContainer}>
            {project.columnOrder.map((columnId) => {
                const column = project.columns[columnId];
                const tasks = column.taskIds.map((taskId) => project.tasks[taskId]);

                return <Column key={column.id} column={column} tasks={tasks} />;
            })}
        </div>
    );
};

export default KanbanBoard;
