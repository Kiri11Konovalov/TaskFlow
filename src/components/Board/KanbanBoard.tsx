import React, { useState } from 'react';
import { useBoard } from '../../context/BoardContext';
import Column from './Column';
import styles from './Board.module.css';
import {
    DndContext,
    closestCorners,
    useSensor,
    useSensors,
    PointerSensor,
    DragOverlay,
    type DragStartEvent,
    type DragOverEvent,
    type DragEndEvent,
    defaultDropAnimationSideEffects,
    type DropAnimation,
} from '@dnd-kit/core';
import TaskCard from './TaskCard';
import { createPortal } from 'react-dom';

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

const KanbanBoard = () => {
    const { state, dispatch } = useBoard();
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );

    const project = state.currentProjectId ? state.projects[state.currentProjectId] : null;

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        // В будущем можно добавить логику
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;

        if (!over) return;
        if (!project) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Находим колонки
        const sourceColumn = Object.values(project.columns).find(col => col.taskIds.includes(activeId));

        // overId может быть как задачей, так и колонкой
        let destColumn = Object.values(project.columns).find(col => col.taskIds.includes(overId));
        if (!destColumn) {
            // Пробуем найти колонку по ID (если дропнули на пустую колонку)
            destColumn = project.columns[overId];
        }

        if (!sourceColumn || !destColumn) return;

        if (sourceColumn.id !== destColumn.id) {
            // Перемещение между колонками
            const sourceIndex = sourceColumn.taskIds.indexOf(activeId);
            let destIndex = destColumn.taskIds.indexOf(overId);
            if (destIndex === -1) {
                destIndex = destColumn.taskIds.length;
            }

            dispatch({
                type: 'MOVE_TASK',
                payload: {
                    projectId: project.id,
                    sourceColId: sourceColumn.id,
                    destColId: destColumn.id,
                    sourceIndex,
                    destIndex,
                    taskId: activeId
                }
            });
        } else {
            // Сортировка внутри одной колонки
            const sourceIndex = sourceColumn.taskIds.indexOf(activeId);
            const destIndex = sourceColumn.taskIds.indexOf(overId);

            if (sourceIndex !== destIndex) {
                dispatch({
                    type: 'MOVE_TASK',
                    payload: {
                        projectId: project.id,
                        sourceColId: sourceColumn.id,
                        destColId: destColumn.id,
                        sourceIndex,
                        destIndex,
                        taskId: activeId
                    }
                });
            }
        }
    };

    if (!project) {
        return <div className={styles.boardContainer}>Выберите проект</div>;
    }

    const activeTask = activeId ? project.tasks[activeId] : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className={`${styles.boardContainer} fadeIn`}>
                <div className={styles.boardContent}>
                    {project.columnOrder.map((columnId) => {
                        const column = project.columns[columnId];
                        const tasks = column.taskIds
                            .map((taskId) => project.tasks[taskId])
                            .filter(task => {
                                if (!state.searchQuery) return true;
                                const query = state.searchQuery.toLowerCase();
                                return (
                                    task.title.toLowerCase().includes(query) ||
                                    (task.description && task.description.toLowerCase().includes(query))
                                );
                            });

                        return <Column key={column.id} column={column} tasks={tasks} projectId={project.id} />;
                    })}
                </div>
            </div>

            {createPortal(
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeTask ? <TaskCard task={activeTask} /> : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
};

export default KanbanBoard;
