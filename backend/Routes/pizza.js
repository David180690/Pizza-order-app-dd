const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

router.get("/list", (req, res) => {
  res.sendFile(
    path.join(`${__dirname}/../../frontend/public/pizza_list/pizza_list.html`)
  );
});

router.post("/list", (req, res) => {
  const postedData = JSON.stringify(req.body, null, 2);
  const filePath = path.join(`${__dirname}/../data/current_order.json`);

  fs.writeFileSync(filePath, postedData);

  res.send("Successful post.");
});

router.get("/current_order", (req, res) => {
  const filePath = path.join(`${__dirname}/../data/current_order.json`);
  const fileData = fs.readFileSync(filePath);
  res.send(fileData);
});

router.get("/order", (req, res) => {
  res.sendFile(
    path.join(`${__dirname}/../../frontend/public/order/order.html`)
  );
});

router.post("/order", (req, res) => {
  const postedData = JSON.stringify(req.body, null, 2);
  const filePath = path.join(`${__dirname}/../data/current_order.json`);

  const response = fs.writeFileSync(filePath, postedData);

  res.send("Successful post.");
});

router.get("/:id", (req, res) => {
  res.sendFile(
    path.join(
      `${__dirname}/../../frontend/public/${req.params.id}/${req.params.id}.html`
    )
  );
});

module.exports = router;
