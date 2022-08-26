const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 3001;
let users = [];
app.get("/", (req, res) => {
  return res.send({ message: "Hi" });
});
const addUser = (userName, roomId) => {
  users.push({
    userName: userName,
    roomId: roomId,
  });
};
const getRoomUsers = (roomId) => {
  return users.filter((user) => {
    user.roomId == roomId;
  });
};
const userLeave = (userName) => {
  users = users.filter((user) => {
    user.userName != userName;
  });
};
io.on("connection", (socket) => {
  console.log("I'm connected");
  socket.on("join-room", ({ roomId, userName }) => {
    console.log(
      "User joined room of roomId: ",
      roomId,
      " having username ",
      userName
    );
    socket.join(roomId);
    addUser(userName, roomId);
    socket.to(roomId).emit("user-connected", userName);

    io.to(roomId).emit("all-users", getRoomUsers(roomId));

    socket.on("disconnect", () => {
      console.log("user-diconnected: ", userName, roomId);
      socket.leave(roomId);
      userLeave(userName);
      io.to(roomId).emit("all-users", getRoomUsers(roomId));
    });
  });
});
server.listen(PORT, () => {
  console.log("Server is listening on " + PORT);
});
