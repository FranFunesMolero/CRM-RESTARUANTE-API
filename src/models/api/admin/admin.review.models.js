const db = require('../../../config/db');

// /**
//  * Get all reviews with pagination, ordering and optional rating filter
//  * @param {number} page - The page number to fetch (starts from 1)
//  * @param {number} limit - Number of reviews per page 
//  * @param {string} order - Sort order for id ('ASC' or 'DESC')
//  * @param {number} [rating] - Optional rating filter (1-5)
//  * @returns {Promise<Array>} Array of review objects, empty array if no results
//  */
// const selectReviewsByPagination = async (page, limit, order, rating) => {
//     // Calculate offset based on page number and limit
//     const offset = (page - 1) * limit;

//     // Build base query
//     let query = 'SELECT * FROM review';
//     const params = [];

//     // Add rating filter if provided
//     if (rating !== -1) {
//         query += ' WHERE rating = ?';
//         params.push(rating);
//     }

//     // Add ordering and pagination
//     query += ` ORDER BY id ${order} LIMIT ? OFFSET ?`;
//     params.push(limit, offset);

//     // Execute query with parameters
//     const [result] = await db.query(query, params);

//     // Return results array or null if no results found
//     return result.length > 0 ? result : null;
// };

// /**
//  * Get all reviews from the database
//  * @returns {Promise<Array|null>} Array of all review objects if found, null if no reviews exist
//  * @description Retrieves all review records from the database at once - use with caution for large datasets
//  * @example
//  * const reviews = await selectAllReviews();
//  * if (reviews) {
//  *   // Process reviews array
//  * } else {
//  *   // Handle no reviews case
//  * }
//  */
// const selectAllReviews = async () => {
//     // Execute query to select all reviews from the review table
//     const [response] = await db.query('SELECT * FROM review');
    
//     // Return array of reviews if any exist, otherwise null
//     return response.length > 0 ? response : null;
// }

/**
 * Get a review by ID from the database
 * @param {number} id - The ID of the review to fetch
 * @returns {Promise<Object|null>} Review object if found, null otherwise
 * @description Retrieves a single review record by its ID. Returns null if no review exists with that ID.
 * All fields from the review table are returned.
 */
const selectReviewById = async (id) => {
    // Query database for review with matching ID using prepared statement
    const [result] = await db.query('SELECT * FROM review WHERE id = ?', [id]);
    
    // Return first matching review or null if none found
    return result.length > 0 ? result[0] : null;
};

/**
 * Update a review by ID in the database
 * @param {number} id - The ID of the review to update
 * @param {Object} data - Object containing fields to update (e.g. {rating: 5, comment: "Great!"})
 * @returns {Promise<boolean>} True if update was successful, false otherwise
 * @description Updates a review record in the database. The data object can contain any valid 
 * review table columns to update. Only provided fields will be updated. Returns true if a row
 * was updated, false if no matching review was found.
 * @example
 * // Update just the rating
 * await updateReviewById(1, { rating: 4 });
 * // Update multiple fields
 * await updateReviewById(1, { rating: 5, comment: "Excellent service!" });
 */
const updateReviewById = async (id, data) => {
    // Use MySQL's SET ? syntax for safe parameterized updates
    const [result] = await db.query('UPDATE review SET ? WHERE id = ?', [data, id]);
    
    // Return true if a row was updated, false otherwise
    return result.affectedRows > 0;
};

/**
 * Delete a review by ID in the database
 * @param {number} id - The ID of the review to delete
 * @returns {Promise<boolean>} True if deletion was successful, false otherwise
 * @description Deletes a single review record from the database by its ID.
 * Uses a prepared statement to safely delete the record.
 * Returns true if a row was deleted, false if no matching review was found.
 * @example
 * // Delete review with ID 1
 * const wasDeleted = await deleteReviewById(1);
 * if (wasDeleted) {
 *   console.log('Review was successfully deleted');
 * }
 */
const deleteReviewById = async (id) => {
    const [result] = await db.query('DELETE FROM review WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

module.exports = {
    // selectReviewsByPagination,
    selectReviewById,
    updateReviewById,
    deleteReviewById,
    // selectAllReviews
};

