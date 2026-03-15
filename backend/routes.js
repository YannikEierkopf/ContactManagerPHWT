// API routes ---------------------------------------------------------------
const express = require('express');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const helper = require('./helper_routines');
const router = express.Router();

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 60 seconds
    max: 5, // 5 requests per IP
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        const secondsLeft = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
        res.status(429).json({
            error: 'Zu viele Versuche.',
            secondsLeft: secondsLeft
        });
    }
});

// expose the limiter to sub-route modules via the router object
router.authLimiter = authLimiter;

// export the router early so submodules that `require('../routes')` receive the
// same router instance (avoids circular-require returning an incomplete export)
module.exports = router;

// load sub-route modules which attach handlers to the shared `router`
require('./routes/routes.contact');
require('./routes/routes.auth');
require('./routes/routes.users');
require('./routes/routes.inquiries');