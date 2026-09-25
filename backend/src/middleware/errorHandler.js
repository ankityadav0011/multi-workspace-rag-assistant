// Catches anything thrown/passed to next(err) in async routes so the process
// never crashes on a bad request or a slow/failing LLM call.
function errorHandler(err, req, res, next) {
  console.error("[error]", err.message, err.stack ? "\n" + err.stack : "");
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
}

// Wraps an async route handler so thrown errors reach errorHandler instead of crashing.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { errorHandler, asyncHandler };
