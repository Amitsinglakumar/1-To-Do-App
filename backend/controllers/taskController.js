const mongoose = require('mongoose');
const Task = require('../models/Task');

const allowedFields = [
    'title', 'description', 'priority', 'status', 'category',
    'dueDate', 'estimatedTime', 'tags'
];

const invalidId = (id) => !mongoose.Types.ObjectId.isValid(id);

const normalizePayload = (body, partial = false) => {
    const payload = {};
    allowedFields.forEach((field) => {
        if (body[field] !== undefined) payload[field] = body[field];
    });
    if (payload.title !== undefined) payload.title = String(payload.title).trim();
    if (payload.description !== undefined) payload.description = String(payload.description).trim();
    if (payload.category !== undefined) payload.category = String(payload.category).trim() || 'General';
    if (payload.dueDate === '') payload.dueDate = null;
    if (payload.estimatedTime === '') payload.estimatedTime = null;
    if (payload.tags !== undefined) {
        payload.tags = Array.isArray(payload.tags)
            ? payload.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 10)
            : [];
    }
    if (!partial && !payload.status) payload.status = 'Pending';
    return payload;
};

const getTasks = async (req, res, next) => {
    try {
        const { status, priority, category, search, due, sort = 'newest' } = req.query;
        const query = { userId: req.user._id };
        if (status && status !== 'All') query.status = status;
        if (priority && priority !== 'All') query.priority = priority;
        if (category && category !== 'All') query.category = category;
        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.$or = [
                { title: { $regex: escaped, $options: 'i' } },
                { description: { $regex: escaped, $options: 'i' } },
                { tags: { $regex: escaped, $options: 'i' } }
            ];
        }

        const now = new Date();
        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);
        if (due === 'today') query.dueDate = { $gte: now, $lte: endOfToday };
        if (due === 'overdue') {
            query.dueDate = { $lt: now };
            query.status = { $ne: 'Completed' };
        }
        if (due === 'upcoming') query.dueDate = { $gt: endOfToday };

        const sortOptions = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            due: { dueDate: 1, createdAt: -1 },
            priority: { priorityRank: -1, createdAt: -1 }
        };
        const tasks = await Task.find(query).sort(sortOptions[sort] || sortOptions.newest);
        res.json(tasks);
    } catch (error) {
        next(error);
    }
};

const getTask = async (req, res, next) => {
    try {
        if (invalidId(req.params.id)) return res.status(400).json({ message: 'Invalid task id' });
        const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (error) {
        next(error);
    }
};

const createTask = async (req, res, next) => {
    try {
        const payload = normalizePayload(req.body);
        if (!payload.title) return res.status(400).json({ message: 'Task title is required' });
        const task = await Task.create({ ...payload, userId: req.user._id });
        res.status(201).json(task);
    } catch (error) {
        if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
        next(error);
    }
};

const updateTask = async (req, res, next) => {
    try {
        if (invalidId(req.params.id)) return res.status(400).json({ message: 'Invalid task id' });
        const payload = normalizePayload(req.body, true);
        if (payload.title !== undefined && !payload.title) {
            return res.status(400).json({ message: 'Task title cannot be empty' });
        }
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            payload,
            { new: true, runValidators: true }
        );
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (error) {
        if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
        next(error);
    }
};

const deleteTask = async (req, res, next) => {
    try {
        if (invalidId(req.params.id)) return res.status(400).json({ message: 'Invalid task id' });
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted successfully', id: task._id });
    } catch (error) {
        next(error);
    }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
