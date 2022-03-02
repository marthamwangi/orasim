import express from "express";
import path from "path";
import open from "open";
import webpack from "webpack";
import config from "./webpack.config.dev";
import session from "express-session";
const realtorRoutes = require('./routes/realtor.routes');
const clientRoutes = require('./routes/client.routes');
const userRoutes = require('./routes/user.routes');
require("dotenv").config();


const app = express();
const PORT = process.env.PORT
const SESSION_LIFETIME = 3600 * 8000
const SESSION_NAME = process.env.SESSION_NAME
const SESSION_SECRET = process.env.SECRET
const compiler = webpack(config);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//session middleware
app.use(session({
  name: SESSION_NAME,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: SESSION_LIFETIME,
  }
}))
app.use(
  require("webpack-dev-middleware")(compiler, {
    publicPath: config.output.publicPath,
  })
);

//set views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/scss/")));
app.use(express.static(path.join(__dirname, "node_modules/jquery/dist/")));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap-icons/font/")));


app.get("/", function (req, res) {
  res.render('index')
});
app.use('/pores', userRoutes);
app.use('/realtor', realtorRoutes);
app.use('/client', clientRoutes);

app.listen(PORT, function (err) {
  if (err) {
    console.log(err);
  } else {
    open("http://localhost:" + PORT);
    console.log(`Server is running on port ${PORT}.`);

  }
});
export { app };
