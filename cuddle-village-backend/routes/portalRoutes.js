const router = require("express").Router();
const { protect, facilitatorOnly } = require("../middleware/authMiddleware");
const {
  getMyChild, getUpcomingSession, getHubContent,
  getEnrolled, getSessions, createSession, updateSession, markAttendance,
  updateChild, getHubContentAdmin, createHubContent, updateHubContent, deleteHubContent,
} = require("../controllers/portalController");

// ── Public ──────────────────────────────────────────────────────────────────
router.get("/hub-content/:group", getHubContent);

// ── Parent-facing (authenticated) ───────────────────────────────────────────
router.get("/my-child",          protect, getMyChild);
router.get("/upcoming-session",  protect, getUpcomingSession);

// ── Admin / Facilitator ──────────────────────────────────────────────────────
router.get("/admin/enrolled",                    protect, facilitatorOnly, getEnrolled);
router.get("/admin/sessions",                    protect, facilitatorOnly, getSessions);
router.post("/admin/sessions",                   protect, facilitatorOnly, createSession);
router.put("/admin/sessions/:id",                protect, facilitatorOnly, updateSession);
router.post("/admin/sessions/:id/attendance",    protect, facilitatorOnly, markAttendance);
router.put("/admin/children/:userId",            protect, facilitatorOnly, updateChild);
router.get("/admin/hub-content",                 protect, facilitatorOnly, getHubContentAdmin);
router.post("/admin/hub-content",                protect, facilitatorOnly, createHubContent);
router.put("/admin/hub-content/:id",             protect, facilitatorOnly, updateHubContent);
router.delete("/admin/hub-content/:id",          protect, facilitatorOnly, deleteHubContent);

module.exports = router;
