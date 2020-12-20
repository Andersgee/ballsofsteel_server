import express from "express";
import http from "http";
import socketIO from "socket.io";

const PORT = process.env.PORT || 3000;
const app = express();
/*
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
*/
app.get("/port", (req, res) => {
  res.send(`${PORT}`).status(200);
});

const server = http.createServer(app);
const io = socketIO(server);

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

let gamestate = {};
let playerstate = {};

const objlen = (obj) => Object.keys(obj).length;

const initplayer = (socket) => {
  const id = socket.id;
  console.log("Client connected, socket.id: ", id);
  socket.emit("connection_est", "connection established");

  gamestate[id] = { i: objlen(playerstate), p: [0, 0, 0], v: [0, 0, 0] };
  playerstate[id] = [false, false, false, false];

  socket.on("disconnect", () => {
    console.log("Client disconnected, socket.id: ", id);
    delete gamestate[id];
    delete playerstate[id];
  });

  socket.on("state", (x) => {
    //console.log("recieved state: ", x);
    playerstate[id] = x;
  });

  socket.on("setname", (x) => {
    console.log("recieved setname: ", x);
    playerstate[id].name = x;
  });

  socket.on("setcolor", (x) => {
    console.log("recieved setcolor: ", x);
    playerstate[id].color = x;
  });
};

function add(v1, v2) {
  v1[0] += v2[0];
  v1[1] += v2[1];
  v1[2] += v2[2];
}

function muls(v, k) {
  v[0] *= k;
  v[1] *= k;
  v[2] *= k;
}

function step(gamestate, playerstate) {
  for (let id in playerstate) {
    let a = [
      playerstate[id][0] * 1 - playerstate[id][2] * 1, //right/left controls x pos
      0,
      playerstate[id][3] * 1 - playerstate[id][1] * 1, //forward/back controls z pos
    ];
    let v = gamestate[id].v;
    let p = gamestate[id].p;

    muls(a, 0.01); //power of accel
    add(v, a);
    muls(v, 0.95); //friction
    add(p, v);
    p[1] = 1.5;
    //console.log(p);
  }
}

io.on("connection", initplayer);

setInterval(() => {
  step(gamestate, playerstate);
  //let gamestate = { date: new Date(), playerstates: playerstates };
  io.sockets.emit("tick", gamestate);
}, 1000 / 60);
