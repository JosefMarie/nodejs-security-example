const winston = require('winston');

// Configure Winston to log different levels to specific files
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        // Log all errors to error.log
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        // Log info and everything else to combined.log
        new winston.transports.File({ filename: 'logs/combined.log' })
    ],
});

// Also log to console if not in production
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

module.exports = logger;
