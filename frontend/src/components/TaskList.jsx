import Icon from './Icon';
import TaskItem from './TaskItem';

export default function TaskList({ tasks, isLoading, updatingId, onToggle, onEdit, onDelete, onCreate, hasFilters }) {
    if (isLoading) {
        return <div className="task-skeletons" aria-label="Loading tasks">{[1, 2, 3].map((item) => <div className="task-skeleton" key={item}><span /><div><i /><i /></div></div>)}</div>;
    }

    if (!tasks.length) {
        return (
            <div className="empty-state">
                <div className="empty-illustration"><Icon name={hasFilters ? 'search' : 'check'} size={30} /></div>
                <h3>{hasFilters ? 'No matching tasks' : 'Your day is wide open'}</h3>
                <p>{hasFilters ? 'Try a different search or clear a filter.' : 'Add your first task and turn a thought into a plan.'}</p>
                {!hasFilters && <button type="button" className="primary-button" onClick={onCreate}><Icon name="plus" size={18} />Create your first task</button>}
            </div>
        );
    }

    return (
        <div className="task-list">
            {tasks.map((task) => (
                <TaskItem
                    key={task._id}
                    task={task}
                    isUpdating={updatingId === task._id}
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
