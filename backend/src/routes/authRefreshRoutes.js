const express = require('express');
const router = express.Router();
const { refresh } = require('../controllers/authRefreshController');

router.post('/refresh', refresh);

module.exports = router;
