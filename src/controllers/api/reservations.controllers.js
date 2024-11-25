const { insertReservationTable, selectByTableDateTime, selectDistinctReservationId, selectTablesByReservationId } = require("../../models/api/reservation-has-table.models")
const { selectAll, selectByParams, selectById, insertReservation, deleteById, updateStatusById } = require("../../models/api/reservations.models")
const { selectByNumber: selectTableByNumber, selectByLocation, selectTableById, selectTableNumberById } = require("../../models/api/tables.models")
const { getUserById } = require("../../models/api/user.models")
const { hasKeys } = require("../../utils/helpers")
const { sendEmail } = require("../../utils/helpers")
const getAll = async (req, res, next) => {
    const paramsArray = Object.entries(req.query)
    let paramsObect = {}

    // Optional parameters
    if (paramsArray.length) {
        const validParams = new Set(['id', 'date', 'time', 'guests', 'status', 'user_id'])
        const filteredParams = paramsArray.filter(param => validParams.has(param[0]))
        paramsObect = Object.fromEntries(filteredParams)
    }

    // All if no params (paramsObject empty)
    try {
        let reservations = await selectByParams(paramsObect);
        res.json(reservations);

    } catch (err) {
        next(err)
    }
}


const getById = async (req, res, next) => {
    const { id } = req.params

    try {
        const reservation = await selectById(id)

        if (!reservation)
            return res.status(404).json({ message: "The reservation with the requested id does not exists" })

        res.json(reservation)
    } catch (err) {
        next(err)
    }
}

const createByLocation = async (req, res, next) => {

    // Comprobar que el body tenga las propiedades obligatorias
    if (!hasKeys(req.body, ['date', 'time', 'guests', 'status', 'user_id', 'location']))
        return res.status(400).json({ message: "Invalid body data" })

    const { date, time, guests, status, user_id, location } = req.body

    try {
        const user = await getUserById(user_id)
        if (!user)
            return res.status(404).json({ message: "The user with the requested id does not exists" })

        const userEmail = user.email
        sendEmail(
            userEmail,
            `¡Reserva recibida, ${user.name}!`,
            "En breve recibirá un correo con la confirmación de su reserva."
        )
    } catch (err) {
        return next(err)
    }


    let reservationId;

    try {
        const tables = await selectByLocation(location)
        const selectedTables = []

        // Insertar en selectedTables las mesas disponibles 
        // capacity es la capacidad total de las mesas insertadas
        let capacity = 0
        for (const table of tables) {
            const isReserved = await selectByTableDateTime(table.id, date, time)

            if (capacity < guests && !isReserved) {
                capacity += table.capacity
                selectedTables.push(table)
            }
        }

        // Comprobar que la capacidad de las mesas sea suficiente
        if (guests > capacity)
            return res.status(409).json({ message: "Guests exceed our capacity" })

        // Hacer la reserva
        reservationId = await insertReservation(date, time, guests, status, user_id)
        await Promise.all(selectedTables.map(table =>
            insertReservationTable(reservationId, date, time, table.id)))
        const user = await getUserById(user_id)
        const userEmail = user.email

        res.status(200).json({
            message: "Reservation succesful",
            reservationId: reservationId
        })

    } catch (err) {

        // Deshacer la reserva
        await deleteById(reservationId)

        // DB errros
        if (['ER_TRUNCATED_WRONG_VALUE', 'WARN_DATA_TRUNCATED', 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD']
            .includes(err.code))
            return res.status(400).json({ message: "Invalid body data" })

        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ message: "Tables already reserved" })

        next(err)
    }
}

// No se usara al final 
const createWithTables = async (req, res, next) => {
    const { date, time, guests, status, user_id, tables: tablesNum } = req.body
    let reservationId;

    try {
        // Obtener un array de tablas segun sus numeros 
        const tables = await Promise.all(tablesNum.map(tableNum => {
            const table = selectTableByNumber(tableNum)
            if (!table)
                return res.status(404).json({ message: "Selected tables do not exists" })
            return table
        }))

        // Comprobar que la capacidad de las mesas sea suficiente
        const capacity = tables.reduce((acum, next) =>
            acum.capacity + next.capacity)
        if (capacity < guests)
            return res.status(409).json({ message: "Guests exceed tables capacity" })


        // Hacer la reserva
        reservationId = await insertReservation(date, time, guests, status, user_id)
        await Promise.all(tables.map(table =>
            insertReservationTable(reservationId, date, time, table.id)))

        res.status(200).json({
            message: "Reservation succesful",
            reservationId: reservationId
        })

    } catch (err) {

        // Deshacer la reserva
        await deleteById(reservationId)

        // DB errros
        if (['ER_TRUNCATED_WRONG_VALUE', 'WARN_DATA_TRUNCATED', 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD']
            .includes(err.code))
            return res.status(400).json({ message: "Invalid body data" })

        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ message: "Selected tables are reserved" })

        next(err)
    }
}


const deleteReservation = async (req, res, next) => {
    const { id } = req.params

    try {
        const reservation = await selectById(id)
        if (!reservation)
            return res.status(404).json({ message: "The reservation with the requested id does not exists" })

        await deleteById(id)

        return res.status(200).json(reservation)


    } catch (err) {
        next(err)
    }
}

const setReservationStatusById = async (req, res, next) => {
    const { id, status } = req.params

    // Send confirmation email if status is being set to confirmed
    if (status === 'confirmed') {
        // Get reservation details
        const reservation = await selectById(id);
        if (!reservation) {
            return res.status(404).json({
                message: "The reservation with the requested id does not exists"
            });
        }

        // Get user email and send confirmation
        const user = await getUserById(reservation.user_id);
        try {
            sendEmail(
                user.email,
                `¡Buenas noticias, ${user.name}!`,
                "Su reserva ha sido confirmada"
            );
        } catch (err) {
            return next(err)
        }
    }

    try {
        const result = await updateStatusById(id, status)

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

// Similar a getAll, la diferencia es que la respuesta incluye informacion del user
// y ademas los numero de tablas asociadas a esa reserva.
const getAllCustomerReservations = async (req, res, next) => {
    paramsArray = Object.entries(req.query)
    let paramsObect = {}

    // Optional parameters
    if (paramsArray.length) {
        validParams = new Set(['id', 'date', 'time', 'guests', 'status', 'user_id'])
        filteredParams = paramsArray
            .filter(param => validParams.has(param[0]))
        paramsObect = Object.fromEntries(filteredParams)
    }

    try {
        let reservations = await selectByParams(paramsObect)

        // Add user info and tables asociated
        for (const reservation of reservations) {
            const user = await getUserById(reservation.user_id)
            const tablesId = await selectTablesByReservationId(reservation.id)
            reservation.name = user?.name
            reservation.surname = user?.surname
            reservation.tables = []

            for (const tableId of tablesId) {
                const tableNum = await selectTableNumberById(tableId.table_id)
                reservation.tables.push(tableNum.number)
            }
        }

        return res.json(reservations)

    } catch (err) {
        next(err)
    }

}


module.exports = {
    getAll,
    getById,
    deleteReservation,
    createByLocation,
    setReservationStatusById,
    getAllCustomerReservations,
}
