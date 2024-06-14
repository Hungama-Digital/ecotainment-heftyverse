const CreateTables = require("../../service/createTables");
const ReadExcel = require("../../service/dumpExcelDataInDB");
const bodyParser = require("body-parser");

class eventsTicketsController {
  constructor() {
    this.readExcel = new ReadExcel()
    this.createTables = new CreateTables()
  }

  dumpDataInDB = (req, res) => {
    console.log('file Name',req.files);
    let payload = req.files === undefined ? undefined : req.files.file;
      this.readExcel.dumpDataInDB(payload)
        .then((result) => {
          return res.status(200).json({ result });
        })
        .catch((err) => {
          return res.status(500).json(err);
      });
  };
   
  createTable = (req, res) => {
    this.createTables.createTables()
      .then((result) => {
        return res.status(200).json({ result });
      })
      .catch((err) => {
        return res.status(500).json(err);
    });
};

  // dumpDataToMain = (req, res) => {
  //     this.dumpPaytmData.dumpDataToMain()
  //       .then((result) => {
  //         return res.status(200).json({ result });
  //       })
  //       .catch((err) => {
  //         return res.status(500).json(err);
  //     });
  // };
}

module.exports = eventsTicketsController;
