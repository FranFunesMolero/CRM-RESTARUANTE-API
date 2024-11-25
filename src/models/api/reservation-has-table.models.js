const db = require('../../config/db');

const insertReservationTable = async (reservationId, date, time, tableId) => {

    const [result] = await db.query(
        `INSERT INTO reservation_has_table (reservation_id, table_id, date, time)
            VALUES
            (?, ?, ?, ?)`,
        [reservationId, tableId, date, time]
    )


    if (result.affectedRows == 0)
        return false

    return true
}

const selectReservationTableByDate = async (date) => {

    const [reservationsWithTable] = await db.query(
        `SELECT * FROM reservation_has_table WHERE date = ?`,
        [date]
    )

    return reservationsWithTable
}

const selectFutureReservationTable = async (date) => {
    const [reservationsWithTable] = await db.query(
        `SELECT * FROM reservation_has_table
        WHERE date BETWEEN ? AND '9999-12-31';
        `,
        [date]
    )

    return reservationsWithTable
}

const selectByTableDateTime = async (table_id, date, time) => {
    const [table] = await db.query(`
        SELECT * FROM reservation_has_table WHERE table_id = ? AND date = ? AND  time = ?`
        , [table_id, date, time])

    if (table.length)
        return true

    return false
}

const selectTablesByReservationId = async (reservation_id) => {

    const [tables] = await db.query(`
        SELECT table_id FROM reservation_has_table WHERE reservation_id = ?`,
        [reservation_id])

    return tables
}


module.exports = {
    insertReservationTable,
    selectReservationTableByDate,
    selectByTableDateTime,
    selectTablesByReservationId,
    selectFutureReservationTable
}