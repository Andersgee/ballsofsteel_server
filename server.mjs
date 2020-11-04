/*
import express from "express";
import socketIO from "socket.io";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;
const INDEX = "/public/index.html";
*/
/*
const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
*/
/*
const server = express()
  .use((req, res) => res.send(`server is up at port ${PORT}`))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
*/
/*
const server = express();
server.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

const io = socketIO(server);
*/

import http from "http";
import express from "express";
import socketIO from "socket.io";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const app = express();
app.set("port", PORT);
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});
app.get("/port", (req, res) => {
  res.send(`${PORT}`);
});

const server = http.Server(app);
server.listen(PORT, () => {
  console.log("Starting server.", PORT);
});
const io = socketIO(server);

let clientdata = {};
let playerstates = {};

io.on("connection", (socket) => {
  console.log("Client connected, socket.id: ", socket.id);
  clientdata[socket.id] = {};
  playerstates[socket.id] = {};
  socket.emit("connection_est", "connection established");

  socket.on("disconnect", onDisconnect(socket));

  socket.on("state", (data) => {
    clientdata[socket.id] = data;
    playerstates[socket.id] = data;
  });

  socket.on("setname", (data) => {
    console.log("recieved setname: ", data);
    playerstates[socket.id].name = data;
  });
});

const onDisconnect = (socket) => () => {
  console.log("Client disconnected, socket.id: ", socket.id);
  delete playerstates[socket.id];
  delete clientdata[socket.id];
};

setInterval(() => {
  let gamestate = { date: new Date(), playerstates: playerstates };
  io.sockets.emit("tick", gamestate);
}, 1000);
