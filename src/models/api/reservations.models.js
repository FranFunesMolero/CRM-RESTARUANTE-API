const db = require('../../config/db');

const selectAll = async () => {
    const [reservations] = await db.query('SELECT * FROM reservation')
    return reservations
}

const selectById = async (id) => {
    const [[reservation]] = await db.query('SELECT * FROM reservation WHERE id = ?', [id])
    return reservation
}

const selectByParams = async (params) => {
    keys = Object.keys(params)
    values = Object.values(params)
    let queryString = "SELECT * FROM reservation"

    keys.forEach((key, index) => {
        if (index == 0)
            queryString += " WHERE"

        queryString += ` ${key} = ? `

        if (index != keys.length - 1)
            queryString += `AND `
    })

    const [reservations] = await db.query(queryString, values)
    return reservations
}

const insertReservation = async (date, time, guests, status, user_id) => {

    const [result] = await db.query(
        `INSERT INTO reservation (date, time, guests, status, user_id)
         VALUES
         (?, ?, ?, ?, ?)`,
        [date, time, guests, status, user_id]
    )

    if (result.affectedRows == 0)
        return -1

    return result.insertId
}

const deleteById = async (id) => {

    const [result] = await db.query(
        `DELETE 
        FROM reservation
        WHERE id = ?`,
        [id]
    )

    if (result.affectedRows === 0)
        return false

    return true
}

const updateStatusById = async (id, status) => {

    const [result] = await db.query(`
        UPDATE reservation 
        SET status = ?
        WHERE id = ?`,
        [status, id])

    if (result.affectedRows)
        return true

    return false
}


module.exports = {
    selectAll,
    selectById,
    selectByParams,
    insertReservation,
    deleteById,
    updateStatusById
}