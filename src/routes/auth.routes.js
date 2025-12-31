const router = require("express").Router();
const { login } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/requireAuth");

router.post("/login", login);
router.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));

module.exports = router;