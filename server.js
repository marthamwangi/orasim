import express from "express";
import path from "path";
import open from "open";
import webpack from "webpack";
import config from "./webpack.config.dev";
import mysql from "mysql2";

const port = 3000;
const app = express();
const compiler = webpack(config);
const dbconnect = mysql.createConnection({
  host: "localhost",
  user: "marthadev",
  password: "Appleste@ldth8214",
});

app.use(
  require("webpack-dev-middleware")(compiler, {
    publicPath: config.output.publicPath,
  })
);
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/src/index.html"));
});

app.listen(port, function (err) {
  if (err) {
    console.log(err);
  } else {
    open("http://localhost:" + port);
  }
});
dbconnect.connect((err) => {
  if (err) {
    throw err;
  }
  return console.log("connected");
});
app.get("/create", (req, res) => {
  let creteDatabase = "CREATE DATABASE orasim";
  dbconnect.query(creteDatabase, (err) => {
    if (err) {
      throw err;
    }
    res.send(`Database created`);
  });
});
app.use(
  "/css",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
);
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);
app.use("/js", express.static(path.join(__dirname, "node_modules/jquery/dist")));

export { app };
