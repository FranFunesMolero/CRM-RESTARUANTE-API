const db = require('../../config/db');

const selectAll = async () => {
    const [tables] = await db.query('SELECT * FROM `table` ORDER BY number')
    return tables
}

const selectTableById = async (id) => {
    const [[table]] = await db.query('SELECT * FROM `table` WHERE id = ?',
        [id])
    return table
}


const selectByNumber = async (number) => {
    const [[table]] = await db.query('SELECT * FROM `table` WHERE number = ?', [number])
    return table
}

const selectByLocation = async (location) => {
    const [table] = await db.query('SELECT * FROM `table` WHERE location = ?', [location])
    return table
}

const selectTableNumberById = async (id) => {
    const [[number]] = await db.query('SELECT number FROM `table` WHERE id = ?', [id])

    return number
}

const deleteTableById = async (id) => {

    const [result] = await db.query(
        `DELETE 
        FROM \`table\`
        WHERE id = ?`,
        [id]
    )

    if (result.affectedRows === 0)
        return false

    return true
}

const insertTable = async (number, capacity, location) => {

    const [result] = await db.query(
        `INSERT INTO \`table\` (number, capacity, location)
         VALUES
         (?, ?, ?)`,
        [number, capacity, location]
    )

    if (result.affectedRows == 0)
        return -1

    return result.insertId
}

const updateTableCapacityById = async (id, capacity) => {

    const [result] = await db.query(`
        UPDATE \`table\` 
        SET capacity = ?
        WHERE id = ?`,
        [capacity, id])

    if (result.affectedRows)
        return true

    return false
}


module.exports = {
    selectAll,
    selectByNumber,
    selectByLocation,
    selectTableById,
    selectTableNumberById,
    deleteTableById,
    insertTable,
    updateTableCapacityById,
}

