const notFound = (req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) return next(err);
    const status = err.status || (res.statusCode >= 400 ? res.statusCode : 500);
    console.error(err.stack || err.message);
    res.status(status).json({
        message: err.message || 'Something went wrong',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = { notFound, errorHandler };
