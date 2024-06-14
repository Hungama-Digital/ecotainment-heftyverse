const express = require('express');
const v1Route = require('./V1/route');
// const v2Route = require('@routes/v2/route');
// const v3Route = require('@routes/v3/route');

const router = express.Router();

router.use('/v1', v1Route);
// router.use('/v2', v2Route);
// router.use('/v3', v3Route);

module.exports = router;