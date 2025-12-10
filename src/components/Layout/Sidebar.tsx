import { Layout, Plus } from 'lucide-react';
import styles from './Layout.module.css';
import { useBoard } from '../../context/BoardContext';
import clsx from 'clsx';

const Sidebar = () => {
    const { state, dispatch } = useBoard();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <Layout size={24} className="text-indigo-500" style={{ color: 'var(--color-accent)' }} />
                <span>TaskFlow</span>
            </div>

            <div className={styles.projectList}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontWeight: 600, padding: '0 0.5rem' }}>
                    <span>ПРОЕКТЫ</span>
                    <Plus size={16} style={{ cursor: 'pointer' }} />
                </div>

                {Object.values(state.projects).map((project) => (
                    <div
                        key={project.id}
                        className={clsx(styles.projectItem, {
                            [styles.active]: state.currentProjectId === project.id,
                        })}
                        onClick={() => dispatch({ type: 'SET_CURRENT_PROJECT', payload: { projectId: project.id } })}
                    >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: state.currentProjectId === project.id ? 'var(--color-accent)' : 'var(--color-bg-card)' }}></span>
                        {project.name}
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
