const mysql = require("../config/mysql");
const request = require("request");
const { v4: uuidv4 } = require("uuid");

class TrandingYouTubeData {
  constructor() {}

  generateUniqueId = async () => {
    const uniqueId = uuidv4().replace(/-/g, ""); // Remove hyphens from UUID
    const maxLength = 30;
    const truncatedUniqueId = uniqueId.substring(0, maxLength);
    return truncatedUniqueId;
  };

  trandingYouTubeVideo = (payload) => {
    return new Promise(async (resolve, reject) => {
      const apiKey = "AIzaSyCPZm60xdkHE8-5Fi-vlISlgq4YrJIuuyQ";
      const url = `https://www.googleapis.com/youtube/v3/search?part=${payload.query.part}&q=${payload.query.q}&type=${payload.query.type}&regionCode=${payload.query.regionCode}&maxResults=${payload.query.maxResults}&key=${apiKey}`;
      var options = {
        method: "GET",
        json: true,
        url: url,
      };
      request(options, async (error, response) => {
        if (error) {
          throw new Error(error);
        } else {
          let resultData = [];
          for (const item of response.body.items) {
            if (item.id && item.id.videoId) {
              let data = {};
              data.id = await this.generateUniqueId();
              data.videoId = item.id.videoId;
              data.publishedAt = item.snippet.publishedAt;
              data.channelId = item.snippet.channelId;
              data.title = JSON.stringify(item.snippet.title);
              data.channelTitle = item.snippet.channelTitle;
              data.videoUrl = `https://www.youtube.com/watch?v=${item.id.videoId}`;
              // Call videoMetaData API
              try {
                const videoMetaDataResponse = await this.videoMetaData(item.id.videoId);
                data.thumbnailsUrl = videoMetaDataResponse.items[0].snippet.thumbnails.maxres.url;
                let tagsString = videoMetaDataResponse.items[0].snippet.tags.map((tag) => `"${tag}"`).join(", ");
                data.tags = JSON.stringify(tagsString);
                data.categoryId = videoMetaDataResponse.items[0].snippet.categoryId;
                data.viewCount = videoMetaDataResponse.items[0].statistics.viewCount;
                data.likeCount = videoMetaDataResponse.items[0].statistics.likeCount;
                data.commentCount = videoMetaDataResponse.items[0].statistics.commentCount;
              } catch (videoMetaDataError) {
                console.error(`Unable to fetch MetaData of Video`,videoMetaDataError);
              }
              resultData.push(data);
            }
          }
          console.log("Array Length" , resultData.length);

          for (const item of resultData) {
            try {
              const insertQuery = `INSERT INTO ${process.env.MSDATABASE}.youTubeInfo 
                      (id, videoId, publisheAt, channelId, title, thumbnailsUrl, channelTitle, tags, categoryId, videoUrl, viewCount, likeCount, commentCount) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
              const values = [
                item.id,
                item.videoId,
                item.publishedAt,
                item.channelId,
                item.title,
                item.thumbnailsUrl,
                item.channelTitle,
                item.tags,
                item.categoryId,
                item.videoUrl,
                item.viewCount,
                item.likeCount,
                item.commentCount,
              ];
              await this.queryPromise(insertQuery, values);
              console.log("Successfully Store Data In Database");
            } catch (error) {
              console.error("Error dumping data to DB:", error);
            }
          }

          return resolve({
            message: "success",
            statusCode: 200,
            data: resultData,
          });
        }
      });
    });
  };

  videoMetaData = (payload) => {
    return new Promise((resolve, reject) => {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${payload}&key=AIzaSyCPZm60xdkHE8-5Fi-vlISlgq4YrJIuuyQ`;
      var options = {
        method: "GET",
        json: true,
        url: url,
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
module.exports = TrandingYouTubeData;
