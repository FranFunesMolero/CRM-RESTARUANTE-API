const {
    selectUserReviews,
    // selectReviewById,
    selectAllReviews,
    insertReview,
    deleteReview,
    selectReviewByIdAndUserId,
    selectReviewsByPagination
} = require('../../models/api/review.models');
const { BadRequestError, NotFoundError } = require('../../errors/client.errors');
const { BadRequestError: BadServerRequestError } = require('../../errors/server.errors');
const { verifyToken, isNumber } = require('../../utils/helpers');
const { httpStatus, httpCodes } = require('../../utils/serverStatus');
const { selectByParams } = require('../../models/api/reservations.models');

/**
 * Gets all reviews for the authenticated user
 * @param {Object} req - Express request object containing authorization header
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response containing user's reviews
 */
const getUserReviews = async (req, res, next) => {
    try {
        // Check if user exists based on middleware validation
        if (!req.userExistsById) {
            return next(new NotFoundError('User does not exist'));
        }

        // Extract user ID from authorization token
        const { id } = verifyToken(req.headers.authorization);

        // Get all reviews for this user from database
        const reviews = await selectUserReviews(id);
        if (!reviews) {
            return next(new NotFoundError('There are no reviews for this user'));
        }

        // Return success response with reviews data
        res.status(httpCodes.OK).json({
            status: httpCodes.OK,
            title: httpStatus[httpCodes.OK],
            message: 'Reviews fetched successfully',
            data: reviews
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all reviews from the database and send them in the response
 * @param {Request} req - Express request object (not used)
 * @param {Response} res - Express response object used to send the reviews
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>} - Returns void or passes to error handler
 */
const getAllReviews = async (req, res, next) => {
    try {
        const allReviews = await selectAllReviews();
        if (!allReviews) {
            return next(new NotFoundError('No reviews found'));
        }

        // Extract and validate query parameters
        let { page = 1, limit = allReviews.length, order = 'asc', rating = -1 } = req.query;

        // Validate numeric parameters
        if (!isNumber(page) || !isNumber(limit) || !isNumber(rating)) {
            return next(new BadRequestError('Page, limit and rating must be valid numbers'));
        }

        // Convert to integers
        page = parseInt(page);
        limit = parseInt(limit);

        if (page < 1 || limit < 1) {
            return next(new BadRequestError('Page and limit must be positive numbers'));
        }

        // Fetch all reviews from database
        const reviews = await selectReviewsByPagination(page, limit, order, rating);

        // If no reviews found, pass NotFoundError to error handler
        if (!reviews) {
            return next(new NotFoundError('No reviews found'));
        }

        // Send successful response with reviews data
        res.status(httpCodes.OK).json({
            status: httpCodes.OK,
            title: httpStatus[httpCodes.OK],
            message: 'Reviews fetched successfully',
            data: {
                totalPages: Math.ceil(allReviews.length / limit),
                currentPage: page,
                totalReviews: allReviews.length,
                limit,
                reviews
            },
        });
    } catch (error) {
        next(error);
    }
};

// const getReviewsByUserId = async (req, res, next) => {
//     try {
//         if (!req.userExistsById) {
//             return next(new NotFoundError('User does not exist'));
//         }
//         const review = await selectReviewById(req.params.id);

//         if (!review) {
//             return next(new NotFoundError('There are no reviews for this user'));
//         }

//         res.status(httpCodes.OK).json({
//             status: httpCodes.OK,
//             title: httpStatus[httpCodes.OK],
//             message: 'Reviews fetched successfully',
//             data: review
//         });
//     } catch (error) {
//         next(error);
//     }
// };

/**
 * Creates a new review for the authenticated user
 * @param {Object} req - Express request object containing review data in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with creation status
 */
const create = async (req, res, next) => {
    try {
        // Check if user exists based on middleware validation
        if (!req.userExistsById) {
            return next(new BadRequestError('User not found'));
        }

        // Extract user ID from authorization token
        const token = req.headers.authorization;
        const decodedToken = verifyToken(token);
        const userId = decodedToken.id;

        // Add user ID to review data
        req.body.user_id = userId;

        // Confirm if the user has already a completed reservation
        const reservationsConfirmed = await selectByParams({ user_id: userId, status: 'completed' })
        if (reservationsConfirmed.length === 0)
            return next(new BadServerRequestError('Need a completed reservation before making a review'));

        // Attempt to insert the review into database
        const review = await insertReview(req.body);
        if (!review) {
            return next(new BadServerRequestError('Failed to create review'));
        }

        // Return success response
        return res.status(httpCodes.CREATED).json({
            status: httpCodes.CREATED,
            title: httpStatus[httpCodes.CREATED],
            message: 'Review created successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Deletes a review by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with deletion status
 */
const remove = async (req, res, next) => {
    try {
        // Check if user exists based on middleware validation
        if (!req.userExistsById) {
            return next(new NotFoundError('User does not exist'));
        }

        // Extract user ID from authorization token
        const { id } = verifyToken(req.headers.authorization);

        // Check if review exists for this user
        const reviewToDelete = await selectReviewByIdAndUserId(req.params.id, id);

        // If review does not exist, return error
        if (!reviewToDelete) {
            return next(new NotFoundError('Review not found for this user'));
        }

        // Attempt to delete the review from database
        const result = await deleteReview(req.params.id);
        if (!result) {
            return next(new BadServerRequestError('Failed to delete review'));
        }

        // Return success response
        return res.status(httpCodes.OK).json({
            status: httpCodes.OK,
            title: httpStatus[httpCodes.OK],
            message: 'Review deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserReviews,
    getAllReviews,
    // getReviewsByUserId,
    create,
    remove
};

