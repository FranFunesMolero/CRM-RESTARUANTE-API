const { selectAllDishes } = require('../../../models/api/admin/admin.dish.models');
const { httpCodes, httpStatus } = require('../../../utils/serverStatus');
const { NotFoundError } = require('../../../errors/server.errors');
/**
 * Get all dishes from the database and send them in the response
 * @param {Request} req - Express request object containing user authentication info
 * @param {Response} res - Express response object used to send the dishes
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>} - Returns void or passes to error handler
 */
const getDishes = async (req, res, next) => {
    try {
        // Check if authenticated user exists
        if (!req.userExistsById) {
            return next(new NotFoundError('User does not exist'));
        }

        // Fetch all dishes from database
        const dishes = await selectAllDishes();
        
        // If no dishes found, pass NotFoundError to error handler
        if (!dishes) {
            return next(new NotFoundError('No dishes found'));
        }

        // Send successful response with dishes data
        res.status(httpCodes.OK).json({
            status: httpCodes.OK,
            title: httpStatus[httpCodes.OK],
            message: 'Dishes fetched successfully',
            data: dishes
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDishes
};
