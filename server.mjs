import express from "express";
import socketIO from "socket.io";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;
const INDEX = "/public/index.html";
/*
const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
*/
const server = express();

app.get("/", (req, res) => {
  res.send(`server is up at port ${PORT}`);
});

server.listen(port, () => {
  console.log(`Listening on ${PORT}`);
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
