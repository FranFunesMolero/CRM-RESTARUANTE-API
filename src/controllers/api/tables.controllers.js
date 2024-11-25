const { selectReservationTableByDate, selectFutureReservationTable } = require("../../models/api/reservation-has-table.models")
const { selectAll, selectTableById, deleteTableById: deleteTable, updateTableCapacityById, insertTable } = require("../../models/api/tables.models");
const { hasKeys } = require("../../utils/helpers");

const getAllTables = async (req, res, next) => {
    try {
        let tables = await selectAll();
        res.json(tables);

    } catch (err) {
        next(err)
    }
}

const removeTableById = async (req, res, next) => {
    const { id } = req.params

    try {
        const table = await selectTableById(id)
        if (!table)
            return res.status(404).json({ message: "The table with the requested id does not exists" })

        await deleteTable(id)

        return res.status(200).json(table)


    } catch (err) {
        next(err)
    }
}

const setTableCapacityById = async (req, res, next) => {
    const { id, capacity } = req.params

    try {
        const result = await updateTableCapacityById(id, capacity)

        if (result)
            res.json({ message: "Update successful" })

    } catch (err) {

        // DB errros
        if (['ER_TRUNCATED_WRONG_VALUE', 'WARN_DATA_TRUNCATED', 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD']
            .includes(err.code))
            return res.status(400).json({ message: "Invalid body data" })

        next(err)
    }
}

const createTable = async (req, res, next) => {

    // Comprobar que el body tenga las propiedades obligatorias
    if (!hasKeys(req.body, ['number', 'capacity', 'location']))
        return res.status(400).json({ message: "Invalid body data" })

    const { number, capacity, location } = req.body

    try {
        tableId = await insertTable(number, capacity, location)

        res.status(200).json({
            message: "Creation successful",
            "tableId": tableId
        })
    } catch (err) {

        // DB errros
        if (['ER_TRUNCATED_WRONG_VALUE', 'WARN_DATA_TRUNCATED', 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD']
            .includes(err.code))
            return res.status(400).json({ message: "Invalid body data" })

        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ message: "Table with the selected number already exists" })

        next(err)
    }

}

const getFutureTablesReserved = async (req, res, next) => {
    const { date } = req.params

    try {
        const reservantionWithTables = await selectFutureReservationTable(date)
        res.json(reservantionWithTables)
    } catch (err) {
        next(err)
    }
}


const getAllAvailableByDate = async (req, res, next) => {
    const { date } = req.params

    try {
        const tables = await selectAll()
        // Tablas con reservas
        const tablesReserved = await selectReservationTableByDate(date)

        // Creamos un array con todas las tablas y disponibilidad a todas horas
        const availableTables = tables.map(table => ({
            id: table.id,
            number: table.number,
            available: {
                breakfast: true,
                lunch: true,
                dinner: true
            }
        }))

        // Iterando sobre las tablas reservadas cambiamos la disponibilidad de todas las tablas
        for (const ocupied of tablesReserved) {
            availableTables.forEach(table => {
                if (table.id === ocupied.table_id) {
                    table.available[ocupied.time] = false
                }
            });
        }

        res.status(200).json(availableTables)

    } catch (err) {
        next(err)
    }
}

module.exports = {
    getAllAvailableByDate,
    getAllTables,
    removeTableById,
    createTable,
    setTableCapacityById,
    getFutureTablesReserved
}