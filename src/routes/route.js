const express = require('express');
const router = express.Router();

const urlController = require("../controllers/urlController")

router.get('/test-me', function (req, res) {
    res.send('Testing - My first ever api!')
});

router.post('/url/shorten', urlController.createUrl);
router.get('/:urlCode', urlController.getUrl);

module.exports = router;