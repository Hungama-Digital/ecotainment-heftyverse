const CreateTables = require("../../service/createTables");
const ReadExcel = require("../../service/dumpExcelDataInDB");
const HeftyVerse = require("../../service/heftyVerse");
const bodyParser = require("body-parser");

class eventsTicketsController {
  constructor() {
    this.readExcel = new ReadExcel();
    this.createTables = new CreateTables();
    this.heftyVerse = new HeftyVerse();
  }

  dumpDataInDB = (req, res) => {
    let payload = req.files === undefined ? undefined : req.files.file;
    this.readExcel
      .dumpDataInDB(payload)
      .then((result) => {
        return res.status(200).json({ result });
      })
      .catch((err) => {
        return res.status(500).json(err);
      });
  };

  HeftyVerseDataInDb = (req, res) => {
    let payload = {
      buyer_email: req.body.buyer_email,
      buyer_phone: req.body.buyer_phone,
      buyer_name: req.body.buyer_name,
      original_cost: req.body.original_cost,
      ticket_details: req.body.ticket_details,
    };

    this.heftyVerse
      .HeftyVerseDataInDb(payload)
      .then((result) => {
        return res.status(200).json({ result });
      })
      .catch((err) => {
        return res.status(500).json(err);
      });
  };

  createTable = (req, res) => {
    this.createTables
      .createTables()
      .then((result) => {
        return res.status(200).json({ result });
      })
      .catch((err) => {
        return res.status(500).json(err);
      });
  };

  callHeftyVerse = (req, res) => {
    this.heftyVerse
      .callHeftyVerse()
      .then((result) => {
        if (result.statusCode === 200) {
          return res.status(200).json(result);
        } else {
          return res.status(result.status).json(result);
        }
      })
      .catch((err) => {
        return res.status(500).json(err);
      });
  };
}

module.exports = eventsTicketsController;
