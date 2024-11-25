const { selectById, selectAll, createMenu, deleteMenuById, updateMenuById, obtainDailyMenu } = require("../../models/api/menus.models");
const { ConflictError, BadRequestError, LengthError, NotFoundError } = require('../../errors/client.errors');
const { generateToken, verifyToken, isStringLengthValid } = require('../../utils/helpers');
const { httpCodes, httpStatus } = require("../../utils/serverStatus");


/**
 * Retrieves a menu by its ID.
 * @param {Object} req - Express request object with menuId in params
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns a JSON response with the menu details or calls next with an error
 */
// const getById = async (req, res, next) => {
//     const { menuId } = req.params;
//     try {
//         const menu = await selectById(menuId);
//         res.json(menu)
//     } catch (error) {
//         next(error);
//     }
// }

/**
 * Retrieves all menus from the database.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns a JSON response with an array of menu objects or calls next with an error
 */
// const getAll = async (req, res, next) => {
//     try {
//         const menus = await selectAll();
//         res.json(menus)
//     } catch (error) {
//         next(error);
//     }
// }

const getDailyMenu = async (req, res, next) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ error: 'Date is required' })
        }
        const menu = await obtainDailyMenu(date);
        if (!menu) {
            return res.status(404).json({ error: 'Menu not found for the given date' });
        }
        return res.json(menu);
    } catch (error) {
        next(error);
    }
}



/**
 * Generates a new menu with the provided date, name and dishes.
 * @param {Object} req - Express request object with date, name and dishes in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns a JSON response with a success message or calls next with an error
 */

module.exports = getDailyMenu
