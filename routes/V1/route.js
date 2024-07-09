const express = require("express");
const router = express.Router();
const V1Controller = require("./controller");
const v1Controller = new V1Controller();

// router.route('/dumpData/uploadCsv').post(v1Controller.dumpDataInDB);
router.post('/dumpData/uploadCsv', v1Controller.dumpDataInDB);
router.get('/createTables', v1Controller.createTable);
router.get("/heftyverse", v1Controller.callHeftyVerse);
router.post('/ecotainment', v1Controller.HeftyVerseDataInDb);
router.get('/trandingYouTubeVideoList', v1Controller.trandingYouTubeVideo);
// router.post("/dumpData/calllback/paytm", v1Controller.dumpDataToMain);

module.exports = router;
