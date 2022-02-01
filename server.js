import express from "express";
import path from "path";
import open from "open";
import webpack from "webpack";
import config from "./webpack.config.dev";
require("dotenv").config()

const PORT = process.env.PORT

const app = express();
const compiler = webpack(config);

app.use(
  require("webpack-dev-middleware")(compiler, {
    publicPath: config.output.publicPath,
  })
);
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/src/index.html"));
});



app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")));
app.use(express.static(path.join(__dirname, "node_modules/jquery/dist/")));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap-icons/font/")));

app.listen(PORT, function (err) {
  if (err) {
    console.log(err);
  } else {
    open("http://localhost:" + PORT);
    console.log(`Server is running on port ${PORT}.`);

  }
});



export { app };
