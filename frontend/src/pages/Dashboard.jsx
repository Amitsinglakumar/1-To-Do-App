import { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';
import {
    createTask,
    deleteTask,
    getDashboardStats,
    getErrorMessage,
    getTasks,
    updateTask
} from '../services/api';

const initialFilters = { search: '', status: 'All', priority: 'All', category: 'All', due: '', sort: 'newest' };
const emptyStats = { total: 0, completed: 0, inProgress: 0, pending: 0, overdue: 0, dueSoon: 0, completionRate: 0 };

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState(emptyStats);
    const [filters, setFilters] = useState(initialFilters);
    const [activeNav, setActiveNav] = useState('Overview');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const loadStats = useCallback(async () => {
        try {
            setStats(await getDashboardStats());
        } catch (err) {
            if (err?.response?.status === 401) logout();
        }
    }, [logout]);

    const loadTasks = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const activeFilters = Object.fromEntries(
                Object.entries(filters).filter(([, value]) => value && value !== 'All')
            );
            setTasks(await getTasks(activeFilters));
        } catch (err) {
            if (err?.response?.status === 401) logout();
            else setError(getErrorMessage(err, 'Tasks could not be loaded'));
        } finally {
            setIsLoading(false);
        }
    }, [filters, logout]);

    useEffect(() => { loadStats(); }, [loadStats]);
    useEffect(() => {
        const timer = setTimeout(loadTasks, filters.search ? 300 : 0);
        return () => clearTimeout(timer);
    }, [loadTasks, filters.search]);
    useEffect(() => {
        if (!toast) return undefined;
        const timer = setTimeout(() => setToast(''), 2800);
        return () => clearTimeout(timer);
    }, [toast]);

    const categories = useMemo(() => Array.from(new Set([
        'General', 'Work', 'Personal', 'Study', 'Health',
        ...tasks.map((task) => task.category).filter(Boolean)
    ])), [tasks]);
    const hasFilters = Object.entries(filters).some(([key, value]) => (
        key !== 'sort' && value && value !== 'All'
    ));
    const firstName = user.name?.split(' ')[0] || 'there';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const todayLabel = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

    const openCreate = () => {
        setEditingTask(null);
        setIsFormOpen(true);
    };
    const openEdit = (task) => {
        setEditingTask(task);
        setIsFormOpen(true);
    };
    const closeForm = useCallback(() => {
        setIsFormOpen(false);
        setEditingTask(null);
    }, []);

    const saveTask = async (payload) => {
        setIsSaving(true);
        try {
            if (editingTask) {
                await updateTask(editingTask._id, payload);
                setToast('Task updated');
            } else {
                await createTask(payload);
                setToast('Task created');
            }
            closeForm();
            await Promise.all([loadTasks(), loadStats()]);
        } catch (err) {
            setToast(getErrorMessage(err, 'Task could not be saved'));
        } finally {
            setIsSaving(false);
        }
    };

    const toggleTask = async (task) => {
        setUpdatingId(task._id);
        try {
            const updated = await updateTask(task._id, {
                status: task.status === 'Completed' ? 'Pending' : 'Completed'
            });
            setTasks((current) => current.map((item) => item._id === updated._id ? updated : item));
            setToast(updated.status === 'Completed' ? 'One more task complete' : 'Task moved back to pending');
            await loadStats();
            if (filters.status !== 'All' || filters.due) await loadTasks();
        } catch (err) {
            setToast(getErrorMessage(err, 'Task could not be updated'));
        } finally {
            setUpdatingId(null);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await deleteTask(deleteTarget._id);
            setDeleteTarget(null);
            setToast('Task deleted');
            await Promise.all([loadTasks(), loadStats()]);
        } catch (err) {
            setToast(getErrorMessage(err, 'Task could not be deleted'));
        } finally {
            setIsDeleting(false);
        }
    };

    const selectNav = (label, filterPatch = {}) => {
        setActiveNav(label);
        setFilters({ ...initialFilters, sort: filters.sort, ...filterPatch });
        setMobileMenuOpen(false);
    };
    const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

    const navItems = [
        { label: 'Overview', icon: 'grid', onClick: () => selectNav('Overview') },
        { label: 'All tasks', icon: 'list', count: stats.total, onClick: () => selectNav('All tasks') },
        { label: 'Today', icon: 'calendar', count: stats.dueSoon, onClick: () => selectNav('Today', { due: 'today' }) },
        { label: 'Upcoming', icon: 'clock', onClick: () => selectNav('Upcoming', { due: 'upcoming' }) },
        { label: 'Completed', icon: 'check', count: stats.completed, onClick: () => selectNav('Completed', { status: 'Completed' }) }
    ];

    return (
        <div className="dashboard-shell">
            {mobileMenuOpen && <button className="mobile-overlay" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} />}
            <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-brand"><div className="brand-mark"><span /></div>TaskFlow</div>
                <nav className="main-nav" aria-label="Main navigation">
                    <span className="nav-label">Workspace</span>
                    {navItems.map((item) => (
                        <button key={item.label} className={activeNav === item.label ? 'active' : ''} onClick={item.onClick}>
                            <Icon name={item.icon} size={19} /><span>{item.label}</span>
                            {item.count > 0 && <b>{item.count}</b>}
                        </button>
                    ))}
                    <span className="nav-label categories-label">Categories</span>
                    {['Work', 'Personal', 'Study'].map((category, index) => (
                        <button key={category} className={activeNav === category ? 'active' : ''} onClick={() => selectNav(category, { category })}>
                            <i className={`category-dot dot-${index + 1}`} /><span>{category}</span>
                        </button>
                    ))}
                </nav>
                <div className="sidebar-focus">
                    <div className="focus-ring" style={{ '--progress': `${stats.completionRate * 3.6}deg` }}><span>{stats.completionRate}%</span></div>
                    <div><strong>Weekly focus</strong><span>{stats.completed} tasks completed</span></div>
                </div>
                <div className="sidebar-user">
                    <UserAvatar user={user} />
                    <div><strong>{user.name}</strong><span>{user.email}</span></div>
                    <button className="icon-button" onClick={logout} aria-label="Sign out"><Icon name="logout" size={18} /></button>
                </div>
            </aside>

            <main className="workspace">
                <header className="topbar">
                    <button className="icon-button mobile-menu" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation"><Icon name="menu" /></button>
                    <label className="search-box">
                        <Icon name="search" size={19} />
                        <input value={filters.search} onChange={(e) => updateFilter('search', e.target.value)} placeholder="Search tasks, notes, or tags" aria-label="Search tasks" />
                        <kbd>/</kbd>
                    </label>
                    <button className="primary-button add-task-top" onClick={openCreate}><Icon name="plus" size={19} />New task</button>
                    <UserAvatar user={user} compact />
                </header>

                <div className="workspace-content">
                    <section className="welcome-row">
                        <div><span className="today-label">{todayLabel}</span><h1>{greeting}, {firstName}.</h1><p>Here is what deserves your attention today.</p></div>
                        <button className="primary-button welcome-add" onClick={openCreate}><Icon name="plus" size={19} />Add task</button>
                    </section>

                    <section className="stats-grid" aria-label="Task overview">
                        <MetricCard label="Total tasks" value={stats.total} note="Across all projects" icon="list" tone="indigo" onClick={() => selectNav('All tasks')} />
                        <MetricCard label="In progress" value={stats.inProgress} note="Keep the momentum" icon="trend" tone="blue" onClick={() => selectNav('In progress', { status: 'In Progress' })} />
                        <MetricCard label="Completed" value={stats.completed} note={`${stats.completionRate}% completion rate`} icon="check" tone="green" onClick={() => selectNav('Completed', { status: 'Completed' })} />
                        <MetricCard label="Overdue" value={stats.overdue} note={stats.overdue ? 'Needs your attention' : 'Everything is on track'} icon="alert" tone="orange" onClick={() => selectNav('Overdue', { due: 'overdue' })} />
                    </section>

                    <section className="task-section">
                        <div className="section-heading">
                            <div><h2>{activeNav === 'Overview' ? 'Your tasks' : activeNav}</h2><p>{isLoading ? 'Finding your tasks...' : `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} in this view`}</p></div>
                            <div className="view-progress"><span><i style={{ width: `${stats.completionRate}%` }} /></span><b>{stats.completionRate}% done</b></div>
                        </div>

                        <div className="filter-bar">
                            <div className="status-tabs" role="group" aria-label="Filter by status">
                                {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
                                    <button key={status} className={filters.status === status ? 'active' : ''} onClick={() => updateFilter('status', status)}>{status}</button>
                                ))}
                            </div>
                            <div className="select-filters">
                                <label>Priority<select value={filters.priority} onChange={(e) => updateFilter('priority', e.target.value)}><option>All</option><option>High</option><option>Medium</option><option>Low</option></select></label>
                                <label>Category<select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}><option>All</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
                                <label>Sort<select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="due">Due date</option><option value="priority">Priority</option></select></label>
                                {hasFilters && <button className="clear-filters" onClick={() => { setFilters(initialFilters); setActiveNav('Overview'); }}>Clear</button>}
                            </div>
                        </div>

                        {error && <div className="error-banner" role="alert"><Icon name="alert" size={19} /><div><strong>We could not load your tasks.</strong><span>{error}</span></div><button onClick={loadTasks}>Try again</button></div>}
                        {!error && <TaskList tasks={tasks} isLoading={isLoading} updatingId={updatingId} onToggle={toggleTask} onEdit={openEdit} onDelete={setDeleteTarget} onCreate={openCreate} hasFilters={hasFilters} />}
                    </section>
                </div>
            </main>

            <button className="mobile-fab" onClick={openCreate} aria-label="Create new task"><Icon name="plus" size={23} /></button>
            <TaskForm task={editingTask} isOpen={isFormOpen} isSaving={isSaving} onClose={closeForm} onSave={saveTask} />
            {deleteTarget && (
                <div className="modal-backdrop" role="presentation">
                    <section className="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
                        <div className="confirm-icon"><Icon name="trash" size={22} /></div>
                        <h2 id="delete-title">Delete this task?</h2>
                        <p><strong>{deleteTarget.title}</strong> will be permanently removed. This action cannot be undone.</p>
                        <div className="confirm-actions"><button className="secondary-button" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>Keep task</button><button className="danger-button" onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? 'Deleting...' : 'Delete task'}</button></div>
                    </section>
                </div>
            )}
            {toast && <div className="toast" role="status"><Icon name="check" size={17} />{toast}</div>}
        </div>
    );
}

function UserAvatar({ user, compact = false }) {
    const initials = user.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'U';
    return <div className={`user-avatar ${compact ? 'compact' : ''}`}>{user.avatar ? <img src={user.avatar} alt="" referrerPolicy="no-referrer" /> : initials}</div>;
}

function MetricCard({ label, value, note, icon, tone, onClick }) {
    return (
        <button className="metric-card" onClick={onClick}>
            <span className={`metric-icon ${tone}`}><Icon name={icon} size={20} /></span>
            <span className="metric-copy"><span>{label}</span><strong>{value}</strong><small>{note}</small></span>
            <Icon name="chevron" size={17} className="metric-chevron" />
        </button>
    );
}
