const express = require('express');
const router = express.Router();

const {
    hasOptionalBodyKeys,
} = require('../../../middlewares/auth');

const { 
    updateById, 
    deleteMenu, 
    getAll, 
    getById, 
    generateMenu 
} = require('../../../controllers/api/admin/admin.menus.controllers');

router.get('/', getAll);
router.get('/:menuId', getById);

router.put(
    '/:menuId',
    hasOptionalBodyKeys(['name', 'date', 'dishes', 'price']),
    updateById
)

router.delete(
    '/:menuId',
    deleteMenu
)

router.post('/', generateMenu);


module.exports = router
