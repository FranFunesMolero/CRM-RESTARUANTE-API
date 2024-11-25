

const {
    BadRequestError,
    NotFoundError,
    ConflictError
} = require("../../../errors/client.errors");

const { deleteMenuById, updateMenuById, selectAll, selectById, createMenu } = require("../../../models/api/admin/admin.menus.models");

const { httpCodes, httpStatus } = require('../../../utils/serverStatus');
const { isNumber } = require('../../../utils/helpers');
const { verifyToken } = require('../../../utils/helpers');

/**
 * Retrieves a menu by its ID.
 * @param {Object} req - Express request object with menuId in params
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=1] - Page number to fetch
 * @param {number} [req.query.limit=10] - Number of menus per page
 * @param {string} [req.query.order='asc'] - Sort order ('asc' or 'desc')
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Paginated menus list with metadata
 * @throws {BadRequestError} If page or limit parameters are invalid
 * @throws {NotFoundError} If menu does not exist
 */
const getById = async (req, res, next) => {
    // Extract the 'menuId' from the route parameters (req.params)
    const { menuId } = req.params;
    try {
        // Call the 'selectById' function to get the menu data by its ID.
        const menu = await selectById(menuId);
        // If the menu is found, respond with a 200 (OK) status and the menu data.
        return res.status(httpCodes.OK).json({
            status: httpCodes.OK,
            title: httpStatus[httpCodes.OK],
            message: 'Menus fetched successfully',
            data: menu
        });
    } catch (error) {
        // If an error occurs, pass it to the next error-handling middleware.
        next(error);
    }
}

const getAll = async (req, res, next) => {
    try {
        // Extract and validate query parameters
        let { page = 1, limit = 10, order = 'asc' } = req.query;

        // Validate numeric parameters
        if (!isNumber(page) || !isNumber(limit)) {
            return next(new BadRequestError('Page and limit must be valid numbers'));
        }

        // Convert to integers
        page = parseInt(page);
        limit = parseInt(limit);

        if (page < 1 || limit < 1) {
            return next(new BadRequestError('Page and limit must be positive numbers'));
        }

        // Validate sort order
        if (!['asc', 'desc'].includes(order)) {
            return next(new BadRequestError('Invalid sort order. Use \'asc\' or \'desc\''));
        }

        // Fetch menus with pagination
        const menus = await selectAll(page, limit, order);

        // Return paginated response
        return res.status(httpCodes.OK).json({
            status: httpCodes.OK,
            title: httpStatus[httpCodes.OK],
            message: 'Menus fetched successfully',
            data: menus
        });
    } catch (error) {
        next(error);
    }
}

const generateMenu = async (req, res, next) => {
    // Step 1: Extract the necessary data (date, name, price) from the request body.
    const { date, name, price, dishes } = req.body;

    try {
        // Step 2: Attempt to create a new menu by calling the 'createMenu' function.
        const newMenu = await createMenu(date, name, dishes, price);
        // Step 3: Check if the menu creation was unsuccessful (i.e., 'newMenu' is falsy or 0).
        // This is a basic validation check; if no menu is created, respond with an error.
        if (!newMenu === 0) {
            return res.status(500).json({ message: 'Error creating menu' });
        }
        // Step 4: If the menu is created successfully, send a success response with a message.
        res.json({ message: `menu ${date} created successfully` });
    } catch (error) {
        // Step 5: If an error occurs during the process (e.g., database issues), pass the error to the next middleware.
        next(error);
    }
}

const deleteMenu = async (req, res, next) => {
    try {
        const menuId = req.params.menuId;
        // Step 2: Retrieve the authorization token from the request headers.
        const token = req.headers.authorization;
        // Step 3: Verify the token to decode the user's information and retrieve their ID.
        const decodedToken = verifyToken(token);
        const { id } = decodedToken;
        // Step 4: Attempt to delete the menu using the user's ID.
        // Call 'deleteUserById' function to delete the menu associated with the user.
        const deletedMenu = await deleteMenuById(menuId);
        // Step 5: If the deletion fails (i.e., 'deletedMenu' is falsy), return a 'BadRequestError'.
        if (!deletedMenu) {
            return next(new BadRequestError('Failed to delete menu'));
        }
        // Step 6: If the menu was successfully deleted, return a success message and a 200 OK status.
        return res.status(httpCodes.OK).json({
            status: httpCodes.OK,
            title: httpStatus[httpCodes.OK],
            message: 'Menu deleted successfully'
        });
    } catch (error) {
        // Step 7: If any error occurs during the process, pass it to the next middleware for error handling.
        next(error);
    }
}

/**
 * Updates a menu by its ID with the provided data.
 * @param {Object} req - Express request object containing menuId in params and update data in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns a JSON response with a success message or calls next with an error
 * @throws {BadRequestError} If the update operation fails
 */
const updateById = async (req, res, next) => {
    try {
        // Extract 'menuId' from the route parameters (req.params)
        const menuId = req.params.menuId;
        const token = req.headers.authorization;
        const decodedToken = verifyToken(token);
        const { id } = decodedToken;
        // Call the 'updateMenuById' function to update the menu in the database using the menuId and request body
        const updatedMenu = await updateMenuById(menuId, req.body);
        // If the menu update fails (i.e., no menu was updated), pass a BadRequestError to the next middleware
        if (!updatedMenu) {
            return next(new BadRequestError('Failed to update menu'));
        }
        // If the menu is successfully updated, respond with a 200 (OK) status and a success message
        return res.status(httpCodes.OK).json({
            status: httpCodes.OK,
            title: httpStatus[httpCodes.OK],
            message: 'Menu updated successfully'
        });
    } catch (error) {
        // If an error occurs during the update process, pass it to the next error-handling middleware
        next(error);
    }
}
module.exports = {
    getById,
    getAll,
    generateMenu,
    deleteMenu,
    updateById
};