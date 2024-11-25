// Import database connection
const db = require('../../config/db');

/**
 * Register a new user in the database
 * @param {Object} userData - User data to register
 * @param {string} userData.name - User's first name
 * @param {string} userData.password - User's hashed password (already hashed before reaching this function)
 * @param {string} userData.email - User's email address
 * @param {string} userData.phone - User's phone number
 * @param {string} userData.surname - User's last name
 * @returns {Promise<Object|null>} Inserted user data or null if insert failed
 */
const registerUser = async ({ name, password, email, phone, surname }) => {
    // Insert new user record into database with prepared statement to prevent SQL injection
    const [response] = await db.query(
        'INSERT INTO user (name, password, email, phone, surname) VALUES (?, ?, ?, ?, ?)',
        [name, password, email, phone, surname]
    );

    // Return response object if insert was successful (has insertId), otherwise null
    return response.insertId ? response : null;
};

/**
 * Get user details by email address
 * @param {string} email - Email address to search for
 * @returns {Promise<Object|null>} User object if found, null otherwise
 * @description Retrieves all user fields including password hash - be careful with data exposure
 */
const getUserByEmail = async (email) => {
    // Query database for user with matching email using prepared statement
    const [response] = await db.query(
        'SELECT * FROM user WHERE email = ?', 
        [email]
    );

    // Return first matching user or null if none found
    return response.length > 0 ? response[0] : null;
};

/**
 * Get user details by ID
 * @param {number} id - User ID to search for
 * @returns {Promise<Object|null>} User object if found, null otherwise
 * @description Retrieves all user fields including password hash - be careful with data exposure
 */
const getUserById = async (id) => {
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

    const allowedFields = ['email', 'name', 'surname', 'phone', 'password'];    

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

// Export functions for use in other modules
module.exports = {
    registerUser,
    getUserByEmail,
    updateUserById,
    getUserById,
    deleteUserById,
};