const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const authJwt = require("./helper/jwt");
const errorHandler = require("./helper/error-handler");
const cors = require("cors");
require("dotenv/config");

app.use(cors());
app.options("*", cors());

const api = process.env.API_URL;

//Routes
const categoriesRouter = require("./routers/categories");
const productsRouter = require("./routers/products");
const usersRouter = require("./routers/users");
const ordersRouter = require("./routers/orders");

//Middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use(errorHandler);
app.use("/public/uploads", express.static(__dirname + "/public/uploads")); // Define public upload as a static folder

//Routers
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/products`, productsRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);

//Creating The Schema ANd Models

//connect to DB
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    dbName: "eshop-database",
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Data Connection Is Ready No Wrong");
  })

  .catch((error) => {
    console.log(error);
  });

//

app.listen(3000, () => {
  console.log(api);
  console.log("server is running http://localhost:3000");
});
