// Custom middleware to log incoming requests
const logger = (req, res, next) => {
    const now = new Date().toISOString();
    console.log(`[${now}] ${req.method} request to ${req.url}`);
    
    // Crucial: Call next() to pass control to the next middleware or route handler
    next(); 
};

module.exports = logger;
