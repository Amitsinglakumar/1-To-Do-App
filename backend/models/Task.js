const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    priorityRank: { type: Number, default: 2, select: false },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending'
    },
    category: { type: String, trim: true, default: 'General', maxlength: 40 },
    dueDate: { type: Date, default: null },
    estimatedTime: { type: Number, min: 0, max: 1440, default: null },
    tags: [{ type: String, trim: true, maxlength: 30 }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    }
}, { timestamps: true });

const priorityRank = (priority) => ({ Low: 1, Medium: 2, High: 3 }[priority] || 2);

taskSchema.pre('save', function setPriorityRank(next) {
    this.priorityRank = priorityRank(this.priority);
    next();
});

taskSchema.pre('findOneAndUpdate', function setPriorityRank() {
    const update = this.getUpdate();
    if (update.priority) update.priorityRank = priorityRank(update.priority);
});

taskSchema.index({ userId: 1, status: 1, dueDate: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
