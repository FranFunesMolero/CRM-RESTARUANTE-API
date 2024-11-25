const db = require('../../config/db');

// SQL queries as constants to improve maintainability
const SQL_QUERIES = {
    SELECT_ALL: 'SELECT id, rating, comment FROM review WHERE user_id = ?',
    SELECT_BY_ID: 'SELECT * FROM review WHERE id = ?',
    SELECT_BY_ID_AND_USER_ID: 'SELECT * FROM review WHERE id = ? AND user_id = ?',
    INSERT: 'INSERT INTO review (user_id, rating, comment) VALUES (?, ?, ?)',
    DELETE: 'DELETE FROM review WHERE id = ?',
};

/**
 * Get all reviews from the database
 * @returns {Promise<Array|null>} Array of reviews or null if none found
 */
const selectUserReviews = async (user_id) => {
    const [result] = await db.query(SQL_QUERIES.SELECT_ALL, [user_id]);
    return result.length ? result : null;
};

/**
 * Get all reviews from the database
 * @returns {Promise<Array|null>} Array of all review objects if found, null if no reviews exist
 * @description Retrieves all review records from the database at once - use with caution for large datasets
 * @example
 * const reviews = await selectAllReviews();
 * if (reviews) {
 *   // Process reviews array
 * } else {
 *   // Handle no reviews case
 * }
 */
const selectAllReviews = async () => {
    // Execute query to select all reviews from the review table
    const [response] = await db.query('SELECT * FROM review');
    
    // Return array of reviews if any exist, otherwise null
    return response.length > 0 ? response : null;
}

/**
 * Get all reviews with pagination, ordering and optional rating filter
 * @param {number} page - The page number to fetch (starts from 1)
 * @param {number} limit - Number of reviews per page 
 * @param {string} order - Sort order for id ('ASC' or 'DESC')
 * @param {number} [rating] - Optional rating filter (1-5)
 * @returns {Promise<Array>} Array of review objects, empty array if no results
 */
const selectReviewsByPagination = async (page, limit, order, rating) => {
    // Calculate offset based on page number and limit
    const offset = (page - 1) * limit;

    // Build base query
    let query = 'SELECT * FROM review';
    const params = [];

    // Add rating filter if provided
    if (rating !== -1) {
        query += ' WHERE rating = ?';
        params.push(rating);
    }

    // Add ordering and pagination
    query += ` ORDER BY id ${order} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute query with parameters
    const [result] = await db.query(query, params);

    // Return results array or null if no results found
    return result.length > 0 ? result : null;
};

/**
 * Get a single review by ID
 * @param {number} id Review ID
 * @returns {Promise<Object|null>} Review object or null if not found
 */
const selectReviewById = async (id) => {
    const [result] = await db.query(SQL_QUERIES.SELECT_BY_ID, [id]);
    return result.length ? result[0] : null;
};

/**
 * Get a single review by ID and user ID
 * @param {number} id Review ID
 * @param {number} user_id User ID
 * @returns {Promise<Object|null>} Review object or null if not found
 */
const selectReviewByIdAndUserId = async (id, user_id) => {
    const [result] = await db.query(SQL_QUERIES.SELECT_BY_ID_AND_USER_ID, [id, user_id]);
    return result.length ? result[0] : null;
};

/**
 * Insert a new review
 * @param {Object} review Review object containing user_id, rating, and comment
 * @returns {Promise<number|null>} Inserted review ID or null if insert failed
 */
const insertReview = async (review) => {
    const { user_id, rating, comment } = review;
    const [result] = await db.query(SQL_QUERIES.INSERT, [user_id, rating, comment]);

    return result.affectedRows > 0 ? result.insertId : null;
};

/**
 * Delete a review by ID
 * @param {number} id Review ID to delete
 * @returns {Promise<number|null>} Number of affected rows or null if delete failed
 */
const deleteReview = async (id) => {
    const [result] = await db.query(SQL_QUERIES.DELETE, [id]);
    return result.affectedRows ? result.affectedRows : null;
};

module.exports = {
    selectUserReviews,
    selectAllReviews,
    selectReviewById,
    insertReview,
    deleteReview,
    selectReviewByIdAndUserId,
    selectReviewsByPagination
};
