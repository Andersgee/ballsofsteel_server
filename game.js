function add(v1, v2) {
  v1[0] += v2[0];
  v1[1] += v2[1];
  v1[2] += v2[2];
}

function step(gamestate, playerstate) {
  for (let id in gamestate) {
    let a = playerstate[id].a;
    let v = gamestate[id].v;
    let p = gamestate[id].p;

    add(v, a);
    add(p, v);
  }
}
