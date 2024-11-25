// Import required dependencies and utilities
const { 
    ConflictError, 
    BadRequestError, 
    LengthError, 
    NotFoundError,
} = require('../../errors/client.errors');
const { 
    registerUser, 
    getUserByEmail, 
    updateUserById, 
    deleteUserById, 
    getUserById,
} = require('../../models/api/user.models');
const { httpCodes, httpStatus } = require('../../utils/serverStatus');
const { 
    generateToken, 
    verifyToken, 
    isStringLengthValid, 
} = require('../../utils/helpers');
const bcrypt = require('bcryptjs');
const { BYCRYPT_SALT_ROUNDS } = require('../../config/constants');
const { deleteReviewByUserId } = require('../../models/api/review.models');

/**
 * Register a new user
 * @param {Object} req - Express request object containing user registration data in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const register = async (req, res, next) => {    
    try {
        if (req.userExistsByEmail) {
            return next(new ConflictError('User already exists'));
        }

        const MAX_PASSWORD_LENGTH = 64;
        // Validate the length of password
        if (!isStringLengthValid(req.body.password, MAX_PASSWORD_LENGTH)) {
            return next(
                new LengthError(`The password must be at most ${MAX_PASSWORD_LENGTH} characters long`)
            );
        }

        // Extract user data from request body
        const { name, password, email, phone, surname } = req.body;

        // Hash the password before storing
        const passwordHash = await bcrypt.hash(password, BYCRYPT_SALT_ROUNDS);
        const newUserData = { name, password: passwordHash, email, phone, surname };

        // Insert new user into database
        const insertedUser = await registerUser(newUserData);
        if (!insertedUser) {
            return next(new BadRequestError('Failed to register user'));
        }

        // Send success response with token
        return res.status(httpCodes.CREATED).json({
            status: httpCodes.CREATED,
            title: httpStatus[httpCodes.CREATED],
            message: 'User registered successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login an existing user
 * @param {Object} req - Express request object containing login credentials in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const login = async (req, res, next) => {
    try {
        if (!req.userExistsByEmail) {
            return next(new NotFoundError('Invalid email or password'));
        }

        const { email, password } = req.body;

        const user = await getUserByEmail(email);

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return next(new NotFoundError('Invalid email or password'));
        }

        // Generate JWT token for authenticated user
        const token = generateToken({ 
            id: user.id, 
            role: user.role,
        });

        // Send success response with token
        return res.status(httpCodes.OK).json({
            status: httpCodes.OK,
            title: httpStatus[httpCodes.OK],
            message: 'User logged in successfully',
            token
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing user's information
 * @param {Object} req - Express request object containing user update data in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const update = async (req, res, next) => {
    try {
        // Check if user exists based on token ID
        if (!req.userExistsById) {
            return next(new NotFoundError('User does not exist'));
        }

        // Check if new email (if provided) is already in use
        if (req.userExistsByEmail) {
            return next(new ConflictError('Email already in use'));
        }
        
        // Extract user ID from authorization token
        const token = req.headers.authorization;

        // Verify JWT token
        const decodedToken = verifyToken(token);

        // Get user ID from verified token
        const { id } = decodedToken;

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
const deleteUser = async (req, res, next) => {
    try {
        // Check if user exists based on token ID from middleware
        if (!req.userExistsById) {
            return next(new NotFoundError('User does not exist'));
        }

        // Extract and verify JWT token from request headers
        const token = req.headers.authorization;
        const decodedToken = verifyToken(token);

        // Get user ID from verified token
        const { id } = decodedToken;

        // Delete reviews associated with the user
        // await deleteReviewByUserId(id);

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
const getUser = async (req, res, next) => {
    try {
        // Check if user exists by token ID
        if (!req.userExistsById) {
            return next(new NotFoundError('User does not exist'));
        }

        // Extract and verify JWT token from request headers
        const token = req.headers.authorization;
        const decodedToken = verifyToken(token);

        // Get user ID from verified token
        const { id } = decodedToken;

        // Attempt to fetch user from database using ID from auth token
        const user = await getUserById(id);

        // Send success response with user data
        return res.status(httpCodes.OK).json({
            status: httpCodes.OK,
            title: httpStatus[httpCodes.OK],
            message: 'User fetched successfully',
            data : user
        });
    } catch (error) {
        next(error);
    }
}


module.exports = {
    register,
    login,
    update,
    deleteUser,
    getUser
};
