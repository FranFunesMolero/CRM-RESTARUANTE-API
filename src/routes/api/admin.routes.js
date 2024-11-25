const express = require('express');
const router = express.Router();

// /api/admin/user
router.use('/user', require('./admin/admin.user.routes'));
router.use('/menu', require('./admin/admin.menu.routes'));
router.use('/review', require('./admin/admin.review.routes'));
router.use('/dish', require('./admin/admin.dish.routes'));

module.exports = router;