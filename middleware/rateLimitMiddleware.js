const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 
  max: 10, // limit each IP to 5 requests per windowMs
  keyGenerator: (req) => {
    // Use the user's ID or IP address as the key
    return req.user ? req.user.user_id : req.ip;
  },
  handler: (req, res, next, options) => {
    // Calculate the remaining attempts
    const remainingAttempts = options.max - options.totalHits;

    // Store the remaining attempts in res.locals
    res.locals.remainingAttempts = remainingAttempts;

    // Set the appropriate headers
    res.setHeader("X-RateLimit-Limit", options.max);
    res.setHeader("X-RateLimit-Remaining", remainingAttempts);
    res.setHeader("X-RateLimit-Reset", new Date(Date.now() + options.windowMs));

    // Return the response
    return res.status(429).json({
      error: "Too many requests, please try again after 1 minutes",
      remainingAttempts,
    });
  },
});

module.exports = limiter;