// Import necessary modules
const mysql = require("../config/mysql");

class CreateTable {
  constructor() {}

  // Method to create tables
  createTables = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const usersTableCreated = await this.execute(
          this.createUsersTableQuery
        );
        if (usersTableCreated) {
          console.log("Dump Excel Data Table Created");
        }

        const releasesTableCreated = await this.execute(
          this.createReleasesTableQuery
        );
        if (releasesTableCreated) {
          console.log("Ticket Info Table Created");
        }

        const youTubeInfoTableCreated = await this.execute(
          this.createyouTubeInfoTableQuery
        );
        if (youTubeInfoTableCreated) {
          console.log("youTube Info Table Created");
        }

        return resolve({
          message: "Tables created successfully",
          statusCode: 200,
        });
      } catch (error) {
        console.error("Failed To Create Tables :", error);
        return reject({
          message: "Failed To Create Tables",
          statusCode: 500,
        });
      }
    });
  };

  // Helper method to execute SQL queries
  execute = async (query) => {
    try {
      await this.queryPromise(query);
      return true;
    } catch (error) {
      console.error(error.stack);
      return false;
    }
  };

  // Define SQL queries as class properties
  createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS dumpexceldata (
      id VARCHAR(50) PRIMARY KEY,
      event_id VARCHAR(50) NOT NULL,
      event_name VARCHAR(100) NOT NULL,
      organizer_name VARCHAR(50) NOT NULL,
      buyer_name VARCHAR(50) NOT NULL,
      buyer_phone VARCHAR(20) NOT NULL,
      buyer_email VARCHAR(100) NOT NULL,
      original_cost FLOAT NOT NULL,
      transaction_id VARCHAR(50) NOT NULL,
      ticket_id VARCHAR(50) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;

  createReleasesTableQuery = `
    CREATE TABLE IF NOT EXISTS ticketinfo (
      id VARCHAR(50) PRIMARY KEY,
      buyer_email VARCHAR(100) NOT NULL,
      buyer_phone VARCHAR(20) NOT NULL,
      buyer_name VARCHAR(50) NOT NULL,
      original_cost FLOAT NOT NULL,
      ticket_details VARCHAR(600) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;

  createyouTubeInfoTableQuery = `
  CREATE TABLE IF NOT EXISTS youTubeInfo (
    id VARCHAR(50) PRIMARY KEY,
    videoId VARCHAR(50),
    publisheAt VARCHAR(50),
    channelId VARCHAR(50),
    title VARCHAR(500),
    thumbnailsUrl VARCHAR(100),
    channelTitle VARCHAR(100),
    tags VARCHAR(1500),
    categoryId VARCHAR(10),
    videoUrl VARCHAR(100),
    viewCount VARCHAR(50),
    likeCount VARCHAR(50),
    commentCount VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`;

  // Method to execute a query with promise
  queryPromise = async (sql, values) => {
    return new Promise((resolve, reject) => {
      mysql.getConnection((err, conn) => {
        if (err) {
          reject(err);
        } else {
          conn.query(sql, values, (error, results) => {
            if (error) {
              conn.release();
              return reject(error);
            }
            conn.release();
            resolve(results);
          });
        }
      });
    });
  };
}

// Export the class
module.exports = CreateTable;
