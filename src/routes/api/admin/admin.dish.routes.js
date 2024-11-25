const express = require('express');
const router = express.Router();
const { getDishes } = require('../../../controllers/api/admin/admin.dish.controllers');

router.get('/', getDishes);

module.exports = router;
