const express = require("express");
var router = express.Router();

const { getAllItems } = require("./controllers/items");
const { createNewItem } = require("./controllers/items");



router.get("/get_all_items", getAllItems);
router.post("/create_new_item", createNewItem);
// router.get("/gettradebyid", getTradeById);
// router.put('/editTradeById',editTradeById)

module.exports = router;
