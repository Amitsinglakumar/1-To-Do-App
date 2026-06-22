import { useState } from 'react';
import { createTask } from '../services/api';

function AddTask({ onTaskAdded }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [category, setCategory] = useState('General');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('Please enter a title');
            return;
        }

        setIsSubmitting(true);
        try {
            const newTask = await createTask({
                title: title.trim(),
                description: description.trim(),
                priority,
                category,
                status: 'Pending'
            });

            onTaskAdded(newTask);
            setTitle('');
            setDescription('');
            setPriority('Medium');
            setCategory('General');
        } catch (error) {
            alert('Failed to create task. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="add-todo-container">
            <h2 className="add-todo-title">✨ Create New Task</h2>
            <form onSubmit={handleSubmit} className="add-todo-form">
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Task title *"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="form-input"
                        disabled={isSubmitting}
                        maxLength={100}
                    />
                </div>
                <div className="form-group">
                    <textarea
                        placeholder="Description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="form-textarea"
                        disabled={isSubmitting}
                        rows={3}
                        maxLength={500}
                    />
                </div>
                
                <div className="form-row" style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <select 
                            value={priority} 
                            onChange={(e) => setPriority(e.target.value)}
                            className="form-input"
                            disabled={isSubmitting}
                        >
                            <option value="Low">Priority: Low</option>
                            <option value="Medium">Priority: Medium</option>
                            <option value="High">Priority: High</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <select 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)}
                            className="form-input"
                            disabled={isSubmitting}
                        >
                            <option value="General">Category: General</option>
                            <option value="Work">Category: Work</option>
                            <option value="Personal">Category: Personal</option>
                            <option value="Study">Category: Study</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Adding...' : '+ Add Task'}
                </button>
            </form>
        </div>
    );
}

export default AddTask;
