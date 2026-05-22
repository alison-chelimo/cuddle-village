const router = require("express").Router();
const { protect, facilitatorOnly } = require("../middleware/authMiddleware");
const { portalLimiter } = require("../middleware/rateLimiter");

router.use(portalLimiter);
const {
  getMyChild, getUpcomingSession, getHubContent,
  getEnrolled, getSessions, createSession, updateSession, markAttendance,
  updateChild, getHubContentAdmin, createHubContent, updateHubContent, deleteHubContent,
  getChildById, getChildAttendance, addProgressNote, getProgressNotes,
  getSessionById, bulkAttendance,
  createAnnouncement, getAnnouncements, updateAnnouncementStatus,
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

// ── Child detail + notes ──────────────────────────────────────────────────────
router.get("/admin/enrolled/:id",             protect, facilitatorOnly, getChildById);
router.get("/admin/children/:id/attendance",  protect, facilitatorOnly, getChildAttendance);
router.post("/admin/children/:id/notes",      protect, facilitatorOnly, addProgressNote);
router.get("/admin/children/:id/notes",       protect, facilitatorOnly, getProgressNotes);

// ── Session detail + bulk attendance ─────────────────────────────────────────
router.get("/admin/sessions/:id",                      protect, facilitatorOnly, getSessionById);
router.post("/admin/sessions/:id/bulk-attendance",     protect, facilitatorOnly, bulkAttendance);

// ── Announcements ─────────────────────────────────────────────────────────────
router.get("/admin/announcements",            protect, facilitatorOnly, getAnnouncements);
router.post("/admin/announcements",           protect, facilitatorOnly, createAnnouncement);
router.patch("/admin/announcements/:id",      protect, facilitatorOnly, updateAnnouncementStatus);

module.exports = router;
