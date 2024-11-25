const db = require('../../../config/db');

/**
 * Retrieves all dishes from the database
 * @returns {Promise<Array|null>} Array of dish objects if found, null if no dishes exist
 * @description Executes a SELECT query on the dish table to fetch all dish records.
 * Returns null if no dishes are found, otherwise returns array of dish objects.
 */
const selectAllDishes = async () => {
    // SQL query to select all columns from dish table
    const query = 'SELECT * FROM dish';
    // Execute query and destructure first element of returned array
    const [result] = await db.query(query);
    // Return results if dishes found, null otherwise
    return result.length > 0 ? result : null;
};

module.exports = {
    selectAllDishes
};
