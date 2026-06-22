import Icon from './Icon';

const formatDueDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const sameDay = (a, b) => a.toDateString() === b.toDateString();
    const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (sameDay(date, today)) return `Today, ${time}`;
    if (sameDay(date, tomorrow)) return `Tomorrow, ${time}`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
};

export default function TaskItem({ task, isUpdating, onToggle, onEdit, onDelete }) {
    const isComplete = task.status === 'Completed';
    const isOverdue = task.dueDate && !isComplete && new Date(task.dueDate) < new Date();

    return (
        <article className={`task-card ${isComplete ? 'is-complete' : ''}`}>
            <button
                type="button"
                className={`task-check ${isComplete ? 'checked' : ''}`}
                onClick={() => onToggle(task)}
                disabled={isUpdating}
                aria-label={isComplete ? `Mark ${task.title} as pending` : `Mark ${task.title} as completed`}
            >
                {isUpdating ? <span className="mini-spinner" /> : isComplete && <Icon name="check" size={15} />}
            </button>

            <div className="task-main">
                <div className="task-title-row">
                    <h3>{task.title}</h3>
                    <span className={`priority priority-${task.priority?.toLowerCase() || 'medium'}`}><i />{task.priority || 'Medium'}</span>
                </div>
                {task.description && <p className="task-description">{task.description}</p>}
                <div className="task-meta">
                    <span className="category-chip"><Icon name="tag" size={14} />{task.category || 'General'}</span>
                    {task.dueDate && <span className={isOverdue ? 'due-overdue' : ''}><Icon name="calendar" size={14} />{isOverdue ? 'Overdue / ' : ''}{formatDueDate(task.dueDate)}</span>}
                    {task.estimatedTime > 0 && <span><Icon name="clock" size={14} />{task.estimatedTime} min</span>}
                    {task.status === 'In Progress' && <span className="status-progress">In progress</span>}
                </div>
                {task.tags?.length > 0 && <div className="task-tags">{task.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}
            </div>

            <div className="task-actions">
                <button type="button" className="icon-button" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`}><Icon name="edit" size={18} /></button>
                <button type="button" className="icon-button danger" onClick={() => onDelete(task)} aria-label={`Delete ${task.title}`}><Icon name="trash" size={18} /></button>
            </div>
        </article>
    );
}
