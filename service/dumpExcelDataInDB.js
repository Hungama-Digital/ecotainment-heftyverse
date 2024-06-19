const XLSX = require("xlsx");
const mysql = require("../config/mysql");
const { v4: uuidv4 } = require("uuid");

class readExcel {
  constructor() {}

  generateUniqueId = async () => {
    const uniqueId = uuidv4().replace(/-/g, ""); // Remove hyphens from UUID
    const maxLength = 30;
    const truncatedUniqueId = uniqueId.substring(0, maxLength);
    return truncatedUniqueId;
  };

  dumpDataInDB = (payload) => {
    return new Promise(async (resolve, reject) => {
      try {
        const data = payload[0].buffer;
        const workbook = XLSX.read(data, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const range = XLSX.utils.decode_range(sheet["!ref"]);
        const numRows = range.e.r + 1;
        console.log("Number of Rows", numRows);

        for (let i = 2; i <= numRows; i++) {
          const row = {
            event_id: sheet[`A${i}`]?.v || "",
            event_name: sheet[`B${i}`]?.v || "",
            organizer_name: sheet[`C${i}`]?.v || "",
            buyer_name: sheet[`D${i}`]?.v || "",
            buyer_phone: sheet[`E${i}`]?.v?.toString() || "",
            buyer_email: sheet[`F${i}`]?.v || "",
            original_cost: sheet[`G${i}`]?.v || "",
            transaction_id: sheet[`H${i}`]?.v || "",
            ticket_id: sheet[`I${i}`]?.v || "",
          };
          console.log(`Row ${i}`, row);

          const userId = await this.generateUniqueId();
          console.log("userId", userId);

          const insertQuery = `INSERT INTO ${process.env.MSDATABASE}.dumpexceldata 
                (id, event_id, event_name, organizer_name, buyer_name, buyer_phone, buyer_email, original_cost, transaction_id, ticket_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          const values = [
            userId,
            row.event_id,
            row.event_name,
            row.organizer_name,
            row.buyer_name,
            row.buyer_phone,
            row.buyer_email,
            row.original_cost,
            row.transaction_id,
            row.ticket_id,
          ];
          await this.queryPromise(insertQuery, values);
          console.log("Inserted into Users table:", row);
        }

        resolve({
          message: "Successfully Store Data In Database",
          statusCode: 201,
        });
      } catch (error) {
        console.error("Error dumping data to DB:", error);
        reject({
          message: "Failed to store data in database",
          statusCode: 500,
        });
      }
    });
  };
  // Method to execute a query with promise
  queryPromise = async (sql, values) => {
    return new Promise((resolve, reject) => {
      mysql.getConnection((err, conn) => {
        if (err) {
          reject(err);
        } else {
          conn.query(sql, values, (error, results) => {
            if (error) {
              return reject(error);
            }
            resolve(results);
          });
        }
      });
    });
  };
}
module.exports = readExcel;
