const router = require("express").Router();
const { validatePromo } = require("../controllers/promoController");

// Public — no auth required to validate a code
router.post("/validate", validatePromo);

module.exports = router;
