// require("module-alias/register");
const Server = require("./config/server");
require("custom-env").env("non-prod");

// Create server instance
const server = new Server();
const PORT = process.env.PORT || 3000;

// Run server
server.run(PORT);
console.log(`Server running on port ${PORT}`);

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Promise Rejection:");
  console.error("reason", reason);
  console.error("Promise:", promise);
});
