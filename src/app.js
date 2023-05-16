const express = require("express");
const cookieParser = require("cookie-parser");
const objectConfig = require("./config/objectConfig"); //Importamos objectConfig
const { uploader } = require("./utils/multer");
const handlebars = require("express-handlebars");
const { Server } = require("socket.io");
const routerApp = require("./routes/routerApp"); //Tiene las rutas de app.js
//__________________________________________________________________
const app = express();
const PORT = 8080; //|| process.env.PORT;
const httpServer = app.listen(PORT, () => {
  console.log(`Escuchando puerto ${PORT}`);
});

const io = new Server(httpServer);

//MONGOOSE : Se conecta a la DB
objectConfig.connectDB();

//__________________________________________________________________
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//handlebars_______________________________________________
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

//cookieparser______________________________________________
app.use(cookieParser());

//express______________________________________________
app.use("/static", express.static(__dirname + "/public"));

//multer______________________________________________
app.post("/single", uploader.single("myFile"), (req, res) => {
  res.status(200).send({
    status: "success",
    message: "El archivo se subió correctamente",
  });
});

//socket.io____________________________________
messages = [];

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  //Socket que recibe el msj
  socket.on("message", (data) => {
    messages.push(data);
    io.emit("messageLogs", messages);
  });
  //Socket de auth
  socket.on("authenticated", (data) => {
    socket.broadcast.emit("newUserConnected", data);
  });
});

//rutas del servidor (app.js) en archivo /routes/routerApp.js
app.use(routerApp);
