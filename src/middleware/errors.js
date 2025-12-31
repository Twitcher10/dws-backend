function notFoundHandler(req, res) {
  res.status(404).json({ message: "Route not found" });
}

function errorHandler(err, req, res, next) {
  console.error("❌ Error:", err);
  res.status(500).json({ message: "Server error" });
}

module.exports = { notFoundHandler, errorHandler };