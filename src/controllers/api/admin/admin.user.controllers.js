const { 
    selectAllUsersByPagination, 
    selectUserById, 
    updateUserById, 
    deleteUserById,
    selectAllUsers
} = require('../../../models/api/admin/admin.user.models');
const { 
    BadRequestError, 
    NotFoundError, 
    ConflictError 
} = require('../../../errors/client.errors');
const { httpCodes, httpStatus } = require('../../../utils/serverStatus');
const { isNumber } = require('../../../utils/helpers');
const bcrypt = require('bcryptjs');
const { BYCRYPT_SALT_ROUNDS } = require('../../../config/constants');

/**
 * Get paginated list of all users
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=1] - Page number to fetch
 * @param {number} [req.query.limit=10] - Number of users per page
 * @param {string} [req.query.order=asc] - Sort order ('asc' or 'desc')
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Paginated users list with metadata
 * @throws {BadRequestError} If page or limit parameters are invalid
 */
const getUsers = async (req, res, next) => {
    try {
        if (!req.userExistsById) {
            return next(new NotFoundError('User does not exist'));
        }

        // Get all users from database
        const allUsers = await selectAllUsers();
        if (allUsers.length === 0) {
            return next(new NotFoundError('No users found'));
        }

        // Extract and validate query parameters
        let { page = 1, limit = allUsers.length, order = 'asc' } = req.query;

        // Validate numeric parameters
        if (!isNumber(page) || !isNumber(limit)) {
            return next(new BadRequestError('Page and limit must be valid numbers'));
        }

        // Convert to integers
        page = parseInt(page);
        limit = parseInt(limit);

        // Validate page and limit are positive numbers
        if (page < 1 || limit < 1) {
            return next(new BadRequestError('Page and limit must be positive numbers'));
        }

        // Validate sort order
        if (!['asc', 'desc'].includes(order)) {
            return next(new BadRequestError('Invalid sort order. Use \'asc\' or \'desc\''));
        }

        // Fetch users with pagination
        const users = await selectAllUsersByPagination(page, limit, order);

        // Return paginated response
        return res.status(httpCodes.OK).json({
            status: httpCodes.OK,
            title: httpStatus[httpCodes.OK],
            message: 'Users fetched successfully',
            data: {
                totalPages: Math.ceil(allUsers.length / limit),
                currentPage: page,
                totalUsers: allUsers.length,
                limit,
                users
            }
        });
    } catch (error) {
        next(error);
    }
}
/**
 * Retrieves user profile information
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from auth middleware
 * @param {number} req.user.id - ID of authenticated user
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next middleware function
 * @returns {Object} User profile data with success message
 * @throws {NotFoundError} If user does not exist in database
 */
const getUserById = async (req, res, next) => {
    try {
        // Check if user exists by token ID
        if (!req.userExistsById) {
            return next(new NotFoundError('User does not exist'));
        }

        const { id } = req.params;

        // Attempt to fetch user from database using ID from auth token
        const user = await selectUserById(id);
        if (!user) {
            return next(new NotFoundError('User does not exist'));
        }

        // Send success response with user data
        return res.status(httpCodes.OK).json({
            status: httpCodes.OK,
            title: httpStatus[httpCodes.OK],
            message: 'User fetched successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update an existing user's information
 * @param {Object} req - Express request object containing user update data in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateById = async (req, res, next) => {
    try {
        // Check if user exists based on token ID
        if (!req.userExistsById) {
            return next(new NotFoundError('User does not exist'));
        }

        // Check if new email (if provided) is already in use
        if (req.userExistsByEmail) {
            return next(new ConflictError('Email already in use'));
        }
        
        const { id } = req.params;

        if (req.body.password) {
            // Hash new password if provided
            req.body.password = await bcrypt.hash(req.body.password, BYCRYPT_SALT_ROUNDS);
        }

        // Attempt to update user in database
        const updatedUser = await updateUserById(id, req.body);
        if (!updatedUser) {
            return next(new BadRequestError('Failed to update user'));
        }

        // Send success response
        return res.status(httpCodes.OK).json({
            status: httpCodes.OK,
            title: httpStatus[httpCodes.OK],
            message: 'User updated successfully'
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Delete a user's account from the system
 * @param {Object} req - Express request object
 * @param {Object} req.userExistsById - Boolean indicating if user exists, set by middleware
 * @param {string} req.headers.authorization - JWT token from request header
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} 
 * @throws {NotFoundError} If user does not exist
 * @throws {UnauthorizedError} If token is invalid
 * @throws {BadRequestError} If deletion fails
 */
const removeById = async (req, res, next) => {
    try {
        // Check if user exists based on token ID from middleware
        if (!req.userExistsById) {
            return next(new NotFoundError('User does not exist'));
        }

        const { id } = req.params;

        // Attempt to delete user from database
        const deletedUser = await deleteUserById(id);
        if (!deletedUser) {
            return next(new BadRequestError('Failed to delete user'));
        }

        // Send success response
        return res.status(httpCodes.OK).json({
            status: httpCodes.OK,
            title: httpStatus[httpCodes.OK],
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { 
    getUsers, 
    getUserById, 
    updateById,
    removeById
};
