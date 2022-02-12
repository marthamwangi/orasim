# 🚀 Redefinig Real Estate

- styling : editorconfig
- package manager : npm
- dev & prod webserver : express
- browsersync : cross device testing
- WIP hosting :
- Module : ES
- Compiler & Transpiler : Babel
- Bundler : Webpack
- Linting : es-lint
- Unit Testing : Mocha
- Assertion Lib : Chai
- Helper Lib : JSDOM
- CI : Jenkins
- HTTP Call Approach : Axios library
- MYSQL
- Node-sass
- Express-rate-limit module is a middleware for Express which is used to limit repeated requests to public APIs and/or endpoints such as password reset. By limiting the number of requests to the server, we can prevent the Denial-of-Service (DoS) attack.

- // parse application/json, basically parse incoming Request Object as a JSON Object
  app.use(bodyParser.json());
- // parse application/x-www-form-urlencoded, basically can only parse incoming Request Object if strings or arrays
  app.use(bodyParser.urlencoded({ extended: false }));
- // combines the 2 above, then you can parse incoming Request Object if object, with nested objects, or generally any type.
  app.use(bodyParser.urlencoded({ extended: true }));
