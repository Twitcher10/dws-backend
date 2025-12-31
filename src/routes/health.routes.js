const router = require("express").Router();
const { query } = require("../db/query");

router.get("/", async (req, res) => {
  try {
    await query("SELECT 1");
    res.json({ ok: true, db: "connected" });
  } catch (e) {
    res.json({ ok: true, db: "not_connected", note: "Set DATABASE_URL" });
  }
});

module.exports = router;