const db = require('../../../config/db');

/**
 * Get all users from the database
 * @param {number} page - Page number
 * @param {number} limit - Number of users per page
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Promise<Array|null>} Array of user objects if found, null if no users exist
 * @description Retrieves all user records from database - be careful with data exposure
 */
const selectAllUsersByPagination = async (page, limit, order) => {
    // Calculate offset based on page and limit
    const offset = (page - 1) * limit;

    // Corrected SQL query with ORDER BY before LIMIT and OFFSET
    const [response] = await db.query(
        `SELECT * FROM user ORDER BY id ${order} LIMIT ? OFFSET ?`, 
        [limit, offset]
    );

    // Return array of users if any exist, otherwise null
    return response.length > 0 ? response : null;
}

/**
 * Get all users from the database without pagination
 * @returns {Promise<Array|null>} Array of all user objects if found, null if no users exist
 * @description Retrieves all user records from database at once - use with caution for large datasets
 * @example
 * const users = await selectAllUsers();
 * if (users) {
 *   // Process users array
 * } else {
 *   // Handle no users case
 * }
 */
const selectAllUsers = async () => {
    const [response] = await db.query('SELECT * FROM user');
    return response.length > 0 ? response : null;
}

/**
 * Get user details by ID
 * @param {number} id - User ID to search for
 * @returns {Promise<Object|null>} User object if found, null otherwise
 * @description Retrieves all user fields including password hash - be careful with data exposure
 */
const selectUserById = async (id) => {
    // Query database for user with matching ID using prepared statement
    const [response] = await db.query(
        'SELECT * FROM user WHERE id = ?',
        [id]
    );

    // Return first matching user or null if none found
    return response.length > 0 ? response[0] : null;
}

/**
 * Update user details in the database
 * @param {Object} userData - User data to update
 * @param {string} userData.id - User ID to update
 * @param {string} [userData.name] - User's new first name (optional)
 * @param {string} [userData.surname] - User's new last name (optional)
 * @param {string} [userData.email] - User's new email address (optional)
 * @param {string} [userData.phone] - User's new phone number (optional)
 * @returns {Promise<boolean>} True if update was successful, false otherwise
 */
const updateUserById = async (id, userData) => {
    // Build dynamic update query based on provided fields
    const updates = [];
    const values = [];

    const allowedFields = ['email', 'name', 'surname', 'phone', 'password', 'role'];    

    Object.entries(userData).forEach(([key, value]) => {
        if (allowedFields.includes(key) && value !== undefined) {
            updates.push(`${key} = ?`);
            values.push(value);
        }
    });

    // Add ID to values array for WHERE clause
    values.push(id);

    // Execute update query with prepared statement
    const [response] = await db.query(
        `UPDATE user SET ${updates.join(', ')} WHERE id = ?`,
        values
    );

    return response.affectedRows > 0;
}  

/**
 * Delete a user from the database by their ID
 * @param {number} id - The ID of the user to delete
 * @returns {Promise<boolean>} True if deletion was successful (user existed and was deleted),
 *                            false if user was not found
 * @throws {Error} If there was a database error during deletion
 */
const deleteUserById = async (id) => {
    // Execute DELETE query with prepared statement for security
    const [response] = await db.query(
        'DELETE FROM user WHERE id = ?',
        [id]
    );

    // Return true if a row was deleted, false if no user was found
    return response.affectedRows > 0;
} 

module.exports = { 
    selectAllUsersByPagination, 
    selectUserById,
    updateUserById,
    deleteUserById,
    selectAllUsers
};