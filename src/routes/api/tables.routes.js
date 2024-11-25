const { getAllAvailableByDate, getAllTables, setTableCapacityById, removeTableById, createTable, getFutureTablesReserved } = require('../../controllers/api/tables.controllers')

const router = require('express').Router()

router.get('/', getAllTables)
router.get('/available/:date', getAllAvailableByDate)
router.get('/future/:date', getFutureTablesReserved)

router.post('/', createTable)

router.put('/:id/capacity/:capacity', setTableCapacityById)

router.delete('/:id', removeTableById)

module.exports = router