const db = require('../../../config/db');
const selectById = async (id) => {
    // Step 1: Query the 'menu' table to get the menu details by its ID.
    const [result] = await db.query('SELECT * FROM menu WHERE id = ?', [id]);
    // Step 2: Query the 'menu_has_dish' table to get the dish associations for the specified menu.
    const [menu_has_dish] = await db.query('SELECT * FROM menu_has_dish WHERE menu_id = ?', [id]);
    // Initialize an array to hold the dishes associated with the menu.
    let dishes = [];
    // Step 3: Loop through each menu-dish association and fetch the dish details from the 'dish' table.
    for (const dish of menu_has_dish) {
        // Query the 'dish' table to get the details of the dish by its ID.
        const [resultDish] = await db.query('SELECT * FROM dish WHERE id = ?', [dish.dish_id]);
        // Add the fetched dish details to the 'dishes' array.
        dishes = [...dishes, ...resultDish];
    };
    // Return the complete menu object with its associated dishes.
    return [result[0], dishes];
}

const selectAll = async (page, limit, order) => {
    // Calculate offset based on page and limit
    const offset = (page - 1) * limit;
    // Corrected SQL query with ORDER BY before LIMIT and OFFSET
    const [response] = await db.query(
        `SELECT * FROM menu ORDER BY id ${order} LIMIT ? OFFSET ?`,
        [limit, offset]
    );
    // Step 1: Query the 'menu' table to get all available menus
    const [menus] = await db.query('SELECT * FROM menu');
    // Initialize an array to hold menus with their respective dishes
    const menusWithDishes = [];
    // Step 2: Loop through each menu to fetch associated dishes
    for (const menu of menus) {
        // Query the 'menu_has_dish' table to get the dish associations for the current menu
        const [menu_has_dish] = await db.query('SELECT * FROM menu_has_dish WHERE menu_id = ?', [menu.id]);
        // Initialize an array to hold the dishes for the current menu
        let dishes = [];
        // Step 3: For each menu-dish association, fetch the dish details from the 'dish' table
        for (const dish of menu_has_dish) {
            // Query the 'dish' table to get the dish details by dish_id
            const [resultDish] = await db.query('SELECT * FROM dish WHERE id = ?', [dish.dish_id]);
            // If the dish exists and has valid data, add it to the dishes array
            if (resultDish && resultDish.length > 0) {
                dishes.push(resultDish[0]);
            }
        };
        // Step 4: Attach the list of dishes to the current menu object
        menu.dishes = dishes;
        // Add the menu with its associated dishes to the final result array
        menusWithDishes.push(menu);
    };
    // Return the array of menus, each with its associated dishes
    return menusWithDishes;
}

const createMenu = async (date, name, dishes, price) => {
    // Step 1: Insert the new menu into the 'menu' table with the provided 'date' and 'name'.
    // The query returns the result object containing the menu's inserted ID.
    const [result] = await db.query('INSERT INTO menu (date, name, price) VALUES (?, ?, ?)', [date, name, price]);
    // Step 2: Retrieve the 'insertId' of the newly created menu, which is the unique ID of the menu.
    const menuId = result.insertId;
    // Step 3: Iterate over each dish ID in the 'dishes' array and create a link between the new menu and the dishes.
    for (const dish_id of dishes) {
        // For each dish, insert a record into the 'menu_has_dish' table, associating the menu with the dish.
        await db.query('INSERT INTO menu_has_dish (menu_id, dish_id) VALUES (?, ?)', [menuId, dish_id]);
    }
    // Step 4: Return the result object, which contains the details of the inserted menu.
    return result;
}

const deleteMenuById = async (id) => {
    try {
        const [deletedMenuHasDishResult] = await db.query('DELETE FROM menu_has_dish WHERE menu_id = ?', [id]);
        const [deletedMenuResult] = await db.query('DELETE FROM menu WHERE id = ?', [id]);
        if (deletedMenuResult.affectedRows > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error deleting menu and related dishes:', error);
        throw new Error('Failed to delete menu and related dishes');
    }
}

const updateMenuById = async (id, menuData) => {
    try {
        const { name, date, dishes, price } = menuData;

        const [result] = await db.query('UPDATE menu SET name = ?, date = ?, price = ? WHERE id = ?', [name, date, price, id]);
        if (result.affectedRows > 0) {

            await db.query('DELETE FROM menu_has_dish WHERE menu_id = ?', [id]);

            for (const dish_id of dishes) {
                await db.query('INSERT INTO menu_has_dish (menu_id, dish_id) VALUES (?, ?)', [id, dish_id]);
            }

            return { id, name, date, price };
        }
        return null;
    } catch (error) {
        console.error('Error updating menu:', error);
        throw new Error('Failed to update menu');
    }
}

module.exports = {
    selectById,
    selectAll,
    createMenu,
    deleteMenuById,
    updateMenuById
};