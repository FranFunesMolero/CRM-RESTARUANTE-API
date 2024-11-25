const router = require('express').Router();

const getDailyMenu = require('../../controllers/api/menus.controllers');



//router.get('/', getAll);
//router.get('/:menuId', getById);

router.get('/', getDailyMenu);

module.exports = router;