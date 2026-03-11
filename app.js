require('dotenv').config(); // Load variables first
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('./logger');
const { getEnvVariableWithAudit } = require('./envMonitor');

const app = express();

// Set security HTTP headers
app.use(helmet());

// Use Morgan to log HTTP requests automatically, stream them into Winston
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Apply Rate Limiting to prevent DDoS or brute-force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per window
    message: "Too many requests, please try again later."
});
app.use(limiter);

app.use(express.json());

// Example Route
app.get('/', (req, res) => {
    res.send('Secure Node.js App running! Check the logs.');
});

// Example of an Admin Route (Only 'admin' can access DB_PASS)
app.post('/admin/data', (req, res) => {
    try {
        const userRole = req.headers['x-user-role'] || 'guest';

        // Allowed roles for this specific secret
        const allowedRoles = ['admin'];

        // Pass the allowed array down to the auditor
        const dbPass = getEnvVariableWithAudit('DB_PASS', userRole, allowedRoles);

        res.json({ message: "Access granted to admin route. Database secured." });
    } catch (error) {
        res.status(403).json({ error: error.message });
    }
});

// Example of a Manager Route (Both 'admin' and 'manager' can access SECRET_KEY)
app.post('/manager/reports', (req, res) => {
    try {
        const userRole = req.headers['x-user-role'] || 'guest';

        // Allowed roles for this specific secret
        const allowedRoles = ['admin', 'manager'];

        // Pass the allowed array down to the auditor
        const secretKey = getEnvVariableWithAudit('SECRET_KEY', userRole, allowedRoles);

        res.json({ message: "Access granted to manager route. Reports generated." });
    } catch (error) {
        res.status(403).json({ error: error.message });
    }
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    logger.error(`Internal Server Error: ${err.message}`);
    res.status(500).send('Something broke securely!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server started successfully on port http://localhost:${PORT}`);
    console.log(`Server running on port http://localhost:${PORT}`);
});
