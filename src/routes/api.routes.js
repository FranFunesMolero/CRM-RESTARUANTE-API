const express = require('express');
const rateLimiter = require('../middlewares/rateLimiter');
const router = express.Router();
const { httpCodes, httpStatus } = require('../utils/serverStatus');
const { hasToken, userExistsByTokenId, isAdmin } = require('../middlewares/auth');

router.use(rateLimiter);

// /api/
router.use('/menu', require('./api/menus.routes'));
router.use('/user', require('./api/user.routes'));
router.use('/tables', hasToken, isAdmin, require('./api/tables.routes'))
router.use('/review', require('./api/review.routes'));
router.use('/reservations', hasToken, require('./api/reservations.routes'));

// Admin routes
// 1. Verify JWT token is present and valid
// 2. Verify user exists by token ID
// 3. Verify user is admin
router.use(
    '/admin',
    hasToken,
    userExistsByTokenId,
    isAdmin,
    require('./api/admin.routes')
);

// Catch any undefined routes
router.use('*', (req, res) => {
    res.status(httpCodes.NOT_FOUND).json({
        status: httpCodes.NOT_FOUND,
        title: httpStatus[httpCodes.NOT_FOUND],
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

module.exports = router;