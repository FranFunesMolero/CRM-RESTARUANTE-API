const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    update, 
    deleteUser, 
    getUser, 
} = require('../../controllers/api/user.controllers');
const { 
    userExistsByEmail, 
    hasRequiredBodyKeys, 
    hasOptionalBodyKeys, 
    removeSpacesOfBody, 
    userExistsByTokenId,
    hasToken
} = require('../../middlewares/auth');

// Required fields for user registration
const REGISTER_KEYS = ['name', 'password', 'email', 'phone', 'surname'];
// Required fields for user login
const LOGIN_KEYS = ['email', 'password'];
// Fields that can be updated for a user
const UPDATE_KEYS = ['email', 'name', 'surname', 'phone', 'password'];

// Register a new user
// 1. Remove extra spaces from request body fields
// 2. Check if email is already registered
// 3. Validate all required fields are present
// 4. Process registration
router.post(
    '/',
    removeSpacesOfBody(REGISTER_KEYS),
    userExistsByEmail, 
    hasRequiredBodyKeys(REGISTER_KEYS),
    register
);

// Login existing user
// 1. Remove extra spaces from credentials
// 2. Verify user exists with provided email
// 3. Validate login credentials are present
// 4. Process login and return JWT token
router.post(
    '/login', 
    removeSpacesOfBody(LOGIN_KEYS), 
    userExistsByEmail,
    hasRequiredBodyKeys(LOGIN_KEYS), 
    login
);

// Get user profile
// 1. Verify JWT token is present and valid
// 2. Verify user exists by token ID
router.get(
    '/', 
    hasToken, 
    userExistsByTokenId, 
    getUser
);

// Update user profile
// 1. Verify JWT token is present and valid
// 2. Clean up request body fields
// 3. Verify user exists by token ID
// 4. Check if new email (if provided) is available
// 5. Validate at least one update field is present
// 6. Process update
router.put(
    '/',
    hasToken,
    removeSpacesOfBody(UPDATE_KEYS),
    userExistsByTokenId,
    userExistsByEmail,
    hasOptionalBodyKeys(UPDATE_KEYS),
    update
);

// Delete user account
// 1. Verify JWT token is present and valid
// 2. Verify user exists by token ID
// 3. Process account deletion
router.delete(
    '/', 
    hasToken, 
    userExistsByTokenId, 
    deleteUser
);

// Admin-only route to manage menu (currently disabled)
// router.post('/menu', isAdmin, menu);

module.exports = router;