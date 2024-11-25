const { 
    // selectReviewsByPagination
    selectReviewById,
    updateReviewById,
    deleteReviewById,
    // selectAllReviews
} = require('../../../models/api/admin/admin.review.models');
const { httpCodes, httpStatus } = require('../../../utils/serverStatus');
const { NotFoundError, BadRequestError } = require('../../../errors/server.errors');
const { isNumber } = require('../../../utils/helpers');

// /**
//  * Get all reviews from the database and send them in the response
//  * @param {Request} req - Express request object (not used)
//  * @param {Response} res - Express response object used to send the reviews
//  * @param {NextFunction} next - Express next middleware function for error handling
//  * @returns {Promise<void>} - Returns void or passes to error handler
//  */
// const getReviews = async (req, res, next) => {
//     try {
//         if (!req.userExistsById) {
//             return next(new NotFoundError('User does not exist'));
//         }

//         const allReviews = await selectAllReviews();
//         if (allReviews.length === 0) {
//             return next(new NotFoundError('No reviews found'));
//         }

//         // Extract and validate query parameters
//         let { page = 1, limit = allReviews.length, order = 'asc', rating = -1 } = req.query;

//         // Validate numeric parameters
//         if (!isNumber(page) || !isNumber(limit) || !isNumber(rating)) {
//             return next(new BadRequestError('Page, limit and rating must be valid numbers'));
//         }

//         // Convert to integers
//         page = parseInt(page);
//         limit = parseInt(limit);
        
//         if (page < 1 || limit < 1) {
//             return next(new BadRequestError('Page and limit must be positive numbers'));
//         }

//         // Fetch all reviews from database
//         const reviews = await selectReviewsByPagination(page, limit, order, rating);

//         // If no reviews found, pass NotFoundError to error handler
//         if (!reviews) {
//             return next(new NotFoundError('No reviews found'));
//         }

//         // Send successful response with reviews data
//         res.status(httpCodes.OK).json({
//             status: httpCodes.OK,
//             title: httpStatus[httpCodes.OK],
//             message: 'Reviews fetched successfully',
//             data: {
//                 totalPages: Math.ceil(allReviews.length / limit),
//                 currentPage: page,
//                 totalReviews: allReviews.length,
//                 limit,
//                 reviews
//             },
//         });
//     } catch (error) {
//         next(error);
//     }
// };

/**
 * Get a review by ID from the database and send it in the response
 */
const getReviewById = async (req, res, next) => {
    try {
        if (!req.userExistsById) {
            return next(new NotFoundError('User does not exist'));
        }

        const review = await selectReviewById(req.params.id);
        if (!review) {
            return next(new NotFoundError('Review not found'));
        }

        res.status(httpCodes.OK).json({
            status: httpCodes.OK,
            title: httpStatus[httpCodes.OK],
            message: 'Review fetched successfully',
            data: review,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update a review by ID in the database and send it in the response
 */
const updateReview = async (req, res, next) => {
    try {
        // Verify user exists based on their token
        if (!req.userExistsById) {
            return next(new NotFoundError('User does not exist'));
        }

        let { rating } = req.body;

        // Validate rating
        if (rating && !isNumber(rating)) {
            return next(new BadRequestError('Rating must be a valid number'));
        }

        // Convert rating to integer
        rating = parseInt(rating);

        if (rating < 1 || rating > 5) {
            return next(new BadRequestError('Rating must be between 1 and 5'));
        }

        req.body.rating = rating;

        const updated = await updateReviewById(req.params.id, req.body);
        if (!updated) {
            return next(new NotFoundError('Review not found or no changes made'));
        }

        res.status(httpCodes.OK).json({
            status: httpCodes.OK,
            title: httpStatus[httpCodes.OK],
            message: 'Review updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a review by ID in the database and send it in the response
 * @param {Object} req - Express request object containing review ID in params
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {NotFoundError} If user does not exist or review is not found
 * @description 
 * 1. Verifies the user exists based on their token
 * 2. Attempts to delete the review with the given ID
 * 3. Returns success response if deleted, error if not found
 * @example
 * // Successful deletion
 * DELETE /api/admin/review/123
 * {
 *   "status": 200,
 *   "title": "OK", 
 *   "message": "Review deleted successfully"
 * }
 */
const deleteReview = async (req, res, next) => {
    try {
        // Verify user exists based on their token
        if (!req.userExistsById) {
            return next(new NotFoundError('User does not exist'));
        }

        // Attempt to delete the review
        const wasDeleted = await deleteReviewById(req.params.id);
        if (!wasDeleted) {
            return next(new NotFoundError('Review not found'));
        }

        // Return success response
        res.status(httpCodes.OK).json({
            status: httpCodes.OK,
            title: httpStatus[httpCodes.OK],
            message: 'Review deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};


module.exports = { 
    // getReviews, 
    getReviewById, 
    updateReview,
    deleteReview
};