const express = require("express");
const app = express();
const fs = require("fs");
const port = 9001;
const path = require("path");
const pizzaRouter = require("./Routes/pizza");
const apiRouter = require("./Routes/api");

app.use(express.json());

app.get("/", (req, res) =>
  res.sendFile(path.join(`${__dirname}/../frontend/public/home/index.html`))
);
app.use("/pizza", pizzaRouter);
app.use("/api", apiRouter);

app.get("/pizza/welcome", (req, res) =>
  res.sendFile(path.join(`${__dirname}/../frontend/public/home/index.html`))
);

app.use("/public", express.static(`${__dirname}/../frontend/public`));

app.listen(port, (_) => console.log(`http://127.0.0.1:${port}`));
