import { useEffect, useState } from 'react';
import Icon from './Icon';

const emptyTask = {
    title: '', description: '', priority: 'Medium', status: 'Pending',
    category: 'General', dueDate: '', estimatedTime: '', tags: ''
};

const toLocalDateTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
};

export default function TaskForm({ task, isOpen, isSaving, onClose, onSave }) {
    const [form, setForm] = useState(emptyTask);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setError('');
        setForm(task ? {
            title: task.title || '',
            description: task.description || '',
            priority: task.priority || 'Medium',
            status: task.status || 'Pending',
            category: task.category || 'General',
            dueDate: toLocalDateTime(task.dueDate),
            estimatedTime: task.estimatedTime ?? '',
            tags: (task.tags || []).join(', ')
        } : emptyTask);
    }, [task, isOpen]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !isSaving) onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.classList.add('modal-open');
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.classList.remove('modal-open');
        };
    }, [isOpen, isSaving, onClose]);

    if (!isOpen) return null;

    const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!form.title.trim()) {
            setError('Give your task a clear title.');
            return;
        }
        setError('');
        await onSave({
            ...form,
            title: form.title.trim(),
            description: form.description.trim(),
            category: form.category.trim() || 'General',
            dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
            estimatedTime: form.estimatedTime === '' ? null : Number(form.estimatedTime),
            tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        });
    };

    return (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && !isSaving && onClose()}>
            <section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-form-title">
                <header className="modal-header">
                    <div>
                        <span className="modal-kicker">{task ? 'Update your plan' : 'Capture what matters'}</span>
                        <h2 id="task-form-title">{task ? 'Edit task' : 'Create a new task'}</h2>
                    </div>
                    <button type="button" className="icon-button" onClick={onClose} disabled={isSaving} aria-label="Close task form">
                        <Icon name="close" size={21} />
                    </button>
                </header>

                <form className="task-form" onSubmit={handleSubmit}>
                    {error && <div className="form-error" role="alert"><Icon name="alert" size={17} />{error}</div>}
                    <label className="field full">Task title
                        <input
                            autoFocus
                            value={form.title}
                            onChange={(e) => setField('title', e.target.value)}
                            placeholder="What needs to be done?"
                            maxLength={100}
                        />
                        <span className="field-count">{form.title.length}/100</span>
                    </label>
                    <label className="field full">Description <span className="optional">Optional</span>
                        <textarea
                            value={form.description}
                            onChange={(e) => setField('description', e.target.value)}
                            placeholder="Add context, notes, or a definition of done"
                            rows={3}
                            maxLength={500}
                        />
                    </label>
                    <label className="field">Status
                        <select value={form.status} onChange={(e) => setField('status', e.target.value)}>
                            <option>Pending</option><option>In Progress</option><option>Completed</option>
                        </select>
                    </label>
                    <label className="field">Priority
                        <select value={form.priority} onChange={(e) => setField('priority', e.target.value)}>
                            <option>Low</option><option>Medium</option><option>High</option>
                        </select>
                    </label>
                    <label className="field">Category
                        <input value={form.category} onChange={(e) => setField('category', e.target.value)} placeholder="Work" maxLength={40} list="task-categories" />
                        <datalist id="task-categories"><option value="General" /><option value="Work" /><option value="Personal" /><option value="Study" /><option value="Health" /></datalist>
                    </label>
                    <label className="field">Due date & time
                        <input type="datetime-local" value={form.dueDate} onChange={(e) => setField('dueDate', e.target.value)} />
                    </label>
                    <label className="field">Estimated minutes
                        <input type="number" min="0" max="1440" value={form.estimatedTime} onChange={(e) => setField('estimatedTime', e.target.value)} placeholder="30" />
                    </label>
                    <label className="field">Tags <span className="optional">Comma separated</span>
                        <input value={form.tags} onChange={(e) => setField('tags', e.target.value)} placeholder="client, planning" />
                    </label>
                    <footer className="modal-actions full">
                        <button type="button" className="secondary-button" onClick={onClose} disabled={isSaving}>Cancel</button>
                        <button type="submit" className="primary-button" disabled={isSaving}>
                            {isSaving ? <><span className="button-spinner" />Saving</> : <><Icon name="check" size={18} />{task ? 'Save changes' : 'Create task'}</>}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}
