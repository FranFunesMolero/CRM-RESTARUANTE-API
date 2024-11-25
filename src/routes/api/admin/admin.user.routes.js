const express = require('express');
const router = express.Router();
const { getUsers } = require('../../../controllers/api/admin/admin.user.controllers');
const { 
    idIsNumber, 
    userExistsById, 
    userExistsByEmail, 
    hasOptionalBodyKeys,
} = require('../../../middlewares/auth');

const { 
    getUserById, 
    updateById, 
    removeById 
} = require('../../../controllers/api/admin/admin.user.controllers');

// Get all users
router.get(
    '/', 
    getUsers
);

// Get user by ID
// 1. Verify user exists by ID
router.get(
    '/:id',
    idIsNumber,
    userExistsById,
    getUserById
);

// Update user by ID
// 1. Verify user exists by ID
// 2. Verify user exists by email
// 3. Verify request body has at least one of the optional keys
router.put(
    '/:id',
    idIsNumber,
    userExistsById,
    userExistsByEmail,
    hasOptionalBodyKeys(['email', 'name', 'surname', 'phone', 'password', 'role']),
    updateById
);

// Delete user by ID
// 1. Verify user exists by ID
router.delete(
    '/:id',
    idIsNumber,
    userExistsById,
    removeById
);



module.exports = router;