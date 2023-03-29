const express = require("express");
var router = express.Router();
// const auth = require("../middleware/auth");

const { getLoginDetails } = require("./controllers/login");


router.post("/login", getLoginDetails);
// router.get("/gettradebyid", getTradeById);
// router.put('/editTradeById',editTradeById)

module.exports = router;
