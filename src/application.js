const bodyParser = require("body-parser");
const compression = require("compression");
const cors = require("cors");
const express = require("express");
const faker = require("faker");
const helmet = require("helmet");
const path = require("path");
const responseTime = require("response-time");
const serveFavicon = require("serve-favicon");
const shortid = require("shortid");
const swaggerUi = require("swagger-ui-express");

const middlewares = require("./shared/middlewares");
const configuration = require("./shared/configuration");
const logger = require("./shared/logger");
const apiRegistrar = require("./shared/api-registrar");

const app = express();

app.set("configuration", configuration);
app.set("logger", logger);

app.use(responseTime());
app.use(middlewares.addRequestId);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(cors());
app.use(helmet());
app.use(serveFavicon(path.join(__dirname, "..", "public", "favicon.ico")));

const swagger = apiRegistrar.registerAllApi(app);

app.use("/documentation", swaggerUi.serve, swaggerUi.setup(swagger));

const people = createConsultants();

app.get("/people", (req, res) => {
  return res.json(people);
});

app.use(middlewares.handleUnknownRoutes);
app.use(middlewares.handleErrors);

module.exports = app;

function createConsultants(number = 100) {
  const consultants = [];
  for (let index = 0; index < number; index += 1) {
    consultants.push(createConsultant());
  }
  return consultants;
}

function createConsultant() {
  return {
    id: shortid.generate(),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    level: randomLevel(),
    salaire: randomSalaire()
  };
}

function randomLevel() {
  return randomInArray([
    "consultant",
    "consultant_confirme",
    "consultant_senior",
    "manager",
    "manage_confirme"
  ]);
}

function randomSalaire() {
  const max = 80000.0;
  const min = 40000.0;
  return (Math.random() * (max - min) + min).toFixed(2);
}

function randomInArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}
