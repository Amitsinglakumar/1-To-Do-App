const Task = require('../models/Task');

const getStats = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const weekAhead = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
        const [total, completed, inProgress, overdue, dueSoon] = await Promise.all([
            Task.countDocuments({ userId }),
            Task.countDocuments({ userId, status: 'Completed' }),
            Task.countDocuments({ userId, status: 'In Progress' }),
            Task.countDocuments({ userId, status: { $ne: 'Completed' }, dueDate: { $lt: now } }),
            Task.countDocuments({
                userId,
                status: { $ne: 'Completed' },
                dueDate: { $gte: now, $lte: weekAhead }
            })
        ]);
        res.json({
            total,
            completed,
            inProgress,
            pending: Math.max(total - completed - inProgress, 0),
            overdue,
            dueSoon,
            completionRate: total ? Math.round((completed / total) * 100) : 0
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getStats };
