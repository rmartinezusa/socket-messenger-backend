const express = require("express");
const { createServer } = require("http");
//const initializeSocketIO = require("./socket");
require("dotenv").config();

const app = express();
const server = createServer(app);
const PORT = 3000;

// cors
const cors = require("cors");
app.use(cors({ origin: /localhost/ }));

app.use(require("morgan")("dev"));
app.use(express.json());

//Setup express middleware
app.use(require("./api/auth").router);
app.use("/users", require("./api/users"));
app.use("/conversations", require("./api/conversations"));
app.use("/messages", require("./api/messages"));

app.use((req, res, next) => {
  next({ status: 404, message: "Endpoint not found." });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500);
  res.json(err.message ?? "Sorry, something broke :(");
});

//Initialize socket.IO with server
//const io = initializeSocketIO(server);

// Start server with socket.io
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});