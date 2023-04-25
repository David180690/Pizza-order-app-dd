const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const orders = JSON.parse(fs.readFileSync(`${__dirname}/../data/orders.json`));
const currentOrders = JSON.parse(
  fs.readFileSync(`${__dirname}/../data/current_order.json`)
);

router.use(express.json());

router.get("/pizza", (req, res) => {
  let json = require(path.join(`${__dirname}/../data/pizza.json`));
  res.send(json.pizzas);
});
router.get("/allergens", (req, res) => {
  let json = require(path.join(`${__dirname}/../data/allergens.json`));
  res.send(json.Allergens);
});

router.get("/order", (req, res) => {
  res.json(orders);
});

router.post("/order", async (req, res) => {
  const updatedOrders = await { ...orders, ...req.body };
  fs.writeFileSync(
    `${__dirname}/../data/orders.json`,
    JSON.stringify(updatedOrders, null, 2)
  );
  res.send("Order Confirmed");
});

router.get("/pizza/:id", (req, res) => {
  let json = require(path.join(`${__dirname}/../data/pizza.json`));
  let filtered = json.pizzas.filter((item) => item.id == req.params.id);
  res.send(filtered);
});

router.get("/current_order", (req, res) => {
  res.json(
    JSON.parse(
      fs.readFileSync(path.join(`${__dirname}/../data/current_order.json`))
    )
  );
});

router.delete("/current_order", (req, res) => {
  console.log("Trying delete");
  fs.writeFileSync(
    `${__dirname}/../data/current_order.json`,
    JSON.stringify({}, null, 2)
  );
  res.send("Current Orders Reset Successfully!");
});

module.exports = router;
