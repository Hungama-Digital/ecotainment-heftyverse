const mysql = require("../config/mysql");
const request = require("request");
const { v4: uuidv4 } = require("uuid");

class HeftyVerse {
  constructor() {}

  generateUniqueId = async () => {
    const uniqueId = uuidv4().replace(/-/g, ""); // Remove hyphens from UUID
    const maxLength = 30;
    const truncatedUniqueId = uniqueId.substring(0, maxLength);
    return truncatedUniqueId;
  };

  //---------------------Old------------------------

  // callHeftyVerse = async (payload) => {
  //   try {
  //     const searchQuery = `SELECT transaction_id FROM ${process.env.MSDATABASE}.dumpexceldata`;
  //     const transactionIds = await this.queryPromise(searchQuery);

  //     if (transactionIds.length > 0) {
  //       console.log("dbresponse : ", transactionIds);
  //     } else {
  //       console.log("Transaction Id Not Found!");
  //       return {
  //         status: 404,
  //         error: "Transaction Id Not Found!",
  //       };
  //     }
  //     for (const transactionId of transactionIds) {
  //       try {
  //         const detailQuery = `
  //                   SELECT d.buyer_email, d.buyer_phone, d.buyer_name, d.original_cost, 
  //                   CONCAT('[', GROUP_CONCAT(d.ticket_id ORDER BY d.ticket_id), ']') AS ticket_details
  //                   FROM ${process.env.MSDATABASE}.dumpexceldata d
  //                   WHERE d.transaction_id = '${transactionId.transaction_id}'
  //                   GROUP BY d.transaction_id, d.buyer_email, d.buyer_phone, d.buyer_name, d.original_cost;
  //               `;
  //         const HeftyData = await this.queryPromise(detailQuery);
  //         console.log(HeftyData[0]);
  //         // Call HeftyVerse API
  //         await this.heftyCall(HeftyData[0]);
  //       } catch (error) {
  //         console.error( `Error processing transaction ${transactionId.transaction_id}:`, error );
  //       }
  //     }
  //     resolve({
  //       message: "Successfully Send Data To Hefty Verse",
  //       statusCode: 200,
  //     });
  //     // Delete All data from table ;
  //    //   TRUNCATE TABLE ecotainment.dumpexceldata;
  //   } catch (error) {
  //     console.error("Database error:", error);
  //     return {
  //       status: 500,
  //       error: "Internal Server Error",
  //     };
  //   }
  // };

  // -------------------------------------
  callHeftyVerse = async (payload) => {
    try {
      // Fetch all transaction IDs in one query
      const searchQuery = `SELECT transaction_id FROM ${process.env.MSDATABASE}.dumpexceldata`;
      const transactionIds = await this.queryPromise(searchQuery);
  
      if (transactionIds.length === 0) {
        console.log("Transaction Id Not Found!");
        return {
          status: 404,
          error: "Transaction Id Not Found!",
        };
      }
  
      for (const transactionId of transactionIds) {
        const detailQuery = `
          SELECT d.buyer_email, d.buyer_phone, d.buyer_name, d.original_cost, 
          CONCAT('[', GROUP_CONCAT(d.ticket_id ORDER BY d.ticket_id), ']') AS ticket_details
          FROM ${process.env.MSDATABASE}.dumpexceldata d
          WHERE d.transaction_id = '${transactionId.transaction_id}'
          GROUP BY d.transaction_id, d.buyer_email, d.buyer_phone, d.buyer_name, d.original_cost;
        `;
  
        try {
          const HeftyData = await this.queryPromise(detailQuery);
          if (HeftyData.length > 0) {
            HeftyData[0].ticket_details = HeftyData[0].ticket_details.slice(1, -1);
            let ticketArray = HeftyData[0].ticket_details.split(',');
            HeftyData[0].ticket_details = ticketArray.map(ticket => ticket.trim().replace(/"/g, ''));
  
            try {
              const heftyResponse = await this.heftyCall(HeftyData[0]);
              console.log(`Hefty Call Success for transaction ${transactionId.transaction_id}`, heftyResponse);
            } catch (heftyError) {
              console.error(`Hefty Call Error for transaction ${transactionId.transaction_id}:`, heftyError);
            }
  
            try {
              const userId = await this.generateUniqueId();
              console.log("userId", userId);
  
              let ticketDetails = "";
              HeftyData[0].ticket_details.forEach((ele) => {
                ticketDetails = ticketDetails + "," + ele;
              });
              // Replace the first comma with an empty string
              ticketDetails = ticketDetails.replace(/,/, "");
  
              console.log(ticketDetails);
              const insertQuery = `INSERT INTO ${process.env.MSDATABASE}.ticketinfo 
                      (id, buyer_email, buyer_phone, buyer_name, original_cost, ticket_details) 
                      VALUES (?, ?, ?, ?, ?, ?)`;
              const values = [
                userId,
                HeftyData[0].buyer_email,
                HeftyData[0].buyer_phone,
                HeftyData[0].buyer_name,
                HeftyData[0].original_cost,
                ticketDetails,
              ];
              await this.queryPromise(insertQuery, values);
              console.log("Successfully Store Data In Database");
            } catch (error) {
              console.error("Error dumping data to DB:", error);
            }
          } else {
            console.error(`No data found for transaction ${transactionId.transaction_id}`);
          }
        } catch (error) {
          console.error(`Error processing transaction ${transactionId.transaction_id}:`, error);
        }
      }
  
      return {
        message: "Successfully Sent Data To Hefty Verse",
        statusCode: 200,
      };
    } catch (error) {
      console.error("Database error:", error);
      return {
        status: 500,
        error: "Internal Server Error",
      };
    }
  };
  
  // -------------------------------------

  HeftyVerseDataInDb = (payload) => {
    return new Promise(async (resolve, reject) => {
      try {
        let heftypayload = {
          buyer_email: payload.buyer_email,
          buyer_phone: payload.buyer_phone,
          buyer_name: payload.buyer_name,
          original_cost: payload.original_cost,
          ticket_details: payload.ticket_details,
        };

        // Call HeftyVerse API
        await this.heftyCall(heftypayload);

        const userId = await this.generateUniqueId();
        console.log("userId", userId);

        let ticketDetails = "";
        heftypayload.ticket_details.forEach((ele) => {
          ticketDetails = ticketDetails + "," + ele;
        });
        // Replace the first comma with an empty string
        ticketDetails = ticketDetails.replace(/,/, "");

        console.log(ticketDetails);
        const insertQuery = `INSERT INTO ${process.env.MSDATABASE}.ticketinfo 
                (id, buyer_email, buyer_phone, buyer_name, original_cost, ticket_details) 
                VALUES (?, ?, ?, ?, ?, ?)`;
        const values = [
          userId,
          heftypayload.buyer_email,
          heftypayload.buyer_phone,
          heftypayload.buyer_name,
          heftypayload.original_cost,
          ticketDetails,
        ];
        await this.queryPromise(insertQuery, values);
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

  // HeftyVerse API calls
  heftyCall = (payload) => {
    console.log("payload : ", payload);
    return new Promise((resolve, reject) => {
      const apiKey = "d76f989a-81dd-11ed-a1eb-0242ac120002";
      // const url = `https://heftyverse-backend.v-verse.space/webhook/ticket-purchase`;
      const url = `https://backend-staging.heftyverse.v-verse.space/webhook/ticket-purchase`;
      var options = {
        method: "POST",
        json: true,
        url: url,
        body: payload,
        headers: {
          authorization: `${apiKey}`,
          "Content-Type": "application/json",
        },
      };
      request(options, (error, response) => {
        if (error) {
          throw new Error(error);
        } else {
          resolve(response.body);
        }
      });
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
module.exports = HeftyVerse;
