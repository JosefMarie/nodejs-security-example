const logger = require('./logger');

// Capture the initial state of environment variables (Baseline)
const initialEnv = { ...process.env };

// 1. Validation (Fail fast if required variables are missing)
const requiredVars = ['DB_USER', 'DB_PASS', 'SECRET_KEY'];
requiredVars.forEach((v) => {
    if (!process.env[v]) {
        logger.error(`Missing required environment variable: ${v}`);
        process.exit(1); // Stop the app from running in an unstable state
    }
});

// 2. Monitor for changes (Immutability check)
const immutableKeys = ['DB_HOST', 'SECRET_KEY'];

function monitorEnvChanges() {
    Object.keys(process.env).forEach((key) => {
        if (process.env[key] !== initialEnv[key]) {
            if (immutableKeys.includes(key)) {
                logger.error(`SECURITY ALERT: Attempt to modify immutable env variable ${key}.`);
                // Revert to original
                process.env[key] = initialEnv[key];
            } else {
                logger.warn(`Environment variable ${key} changed. Old: ${initialEnv[key]}, New: ${process.env[key]}`);
            }
        }
    });
}

// Check every 60 seconds
setInterval(monitorEnvChanges, 60000);

// 3. Audited Access Wrapper
function getEnvVariableWithAudit(key, userRole = 'guest', allowedRoles = ['admin']) {
    const restrictedKeys = ['DB_PASS', 'SECRET_KEY'];
    
    // Role-Based Access Control (RBAC) for env variables
    // Check if the requested key is restricted AND the user is NOT in the allowedRoles array
    if (restrictedKeys.includes(key) && !allowedRoles.includes(userRole)) {
        const errorMsg = `Unauthorized access attempt by role '${userRole}' to ${key}`;
        logger.error(errorMsg);
        throw new Error('Access Denied');
    }
    
    // Audit the access
    logger.info(`Audit: Variable ${key} accessed at ${new Date().toISOString()} by ${userRole}`);
    return process.env[key];
}

module.exports = { getEnvVariableWithAudit };
