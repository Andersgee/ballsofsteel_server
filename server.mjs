import express from "express";
import http from "http";
import socketIO from "socket.io";

const PORT = process.env.PORT || 3000;
const app = express();
app.get("/port", (req, res) => {
  res.send(`${PORT}`).status(200);
});
const server = http.createServer(app);
const io = socketIO(server);

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

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
}, 1000 / 60);
