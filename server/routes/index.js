const express = require("express");
const sneakersRouter = require("./sneakers");
const authRouter = require("./auth");
const uploadRouter = require("./upload");

const router = express.Router();

router.use(sneakersRouter);
router.use(authRouter);
router.use(uploadRouter);

module.exports = router;
