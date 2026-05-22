const User            = require("../models/User");
const LearningSession = require("../models/LearningSession");
const HubContent      = require("../models/HubContent");

// ── Parent-facing ─────────────────────────────────────────────────────────────

exports.getMyChild = async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("name email bookClub")
    .populate("bookClub.sessionsAttended", "date title bookTitle group");
  res.json(user.bookClub || {});
};

exports.getUpcomingSession = async (req, res) => {
  const group = req.user.bookClub?.group;
  if (!group) return res.json(null);

  const session = await LearningSession.findOne({
    group,
    date: { $gte: new Date() },
  }).sort({ date: 1 });

  res.json(session || null);
};

// ── Public ────────────────────────────────────────────────────────────────────

exports.getHubContent = async (req, res) => {
  const { group } = req.params;
  const items = await HubContent.find({ group, isActive: true }).sort({ order: 1, createdAt: 1 });
  res.json(items);
};

// ── Admin / Facilitator ───────────────────────────────────────────────────────

exports.getEnrolled = async (req, res) => {
  const users = await User.find({ "bookClub.group": { $exists: true, $ne: null } })
    .select("name email bookClub createdAt")
    .populate("bookClub.sessionsAttended", "date title");
  res.json(users);
};

exports.getSessions = async (req, res) => {
  const filter = req.query.group ? { group: req.query.group } : {};
  const sessions = await LearningSession.find(filter)
    .sort({ date: -1 })
    .populate("attendees", "name email bookClub");
  res.json(sessions);
};

exports.createSession = async (req, res) => {
  try {
    const session = await LearningSession.create(req.body);
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateSession = async (req, res) => {
  const session = await LearningSession.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!session) return res.status(404).json({ message: "Session not found" });
  res.json(session);
};

exports.markAttendance = async (req, res) => {
  try {
    const { userId, attended } = req.body;
    const session = await LearningSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (attended) {
      // Add to session attendees (deduplicate)
      if (!session.attendees.includes(userId)) {
        session.attendees.push(userId);
      }
      // Add to user's sessionsAttended
      if (!user.bookClub.sessionsAttended.includes(session._id)) {
        user.bookClub.sessionsAttended.push(session._id);
      }
    } else {
      session.attendees = session.attendees.filter(a => a.toString() !== userId);
      user.bookClub.sessionsAttended = user.bookClub.sessionsAttended.filter(
        s => s.toString() !== session._id.toString()
      );
    }

    await Promise.all([session.save(), user.save()]);
    res.json({ message: "Attendance updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateChild = async (req, res) => {
  try {
    const { notes, skills, booksRead } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (notes    !== undefined) user.bookClub.notes     = notes;
    if (skills)                 user.bookClub.skills    = skills;
    if (booksRead)              user.bookClub.booksRead = booksRead;

    await user.save();
    res.json({ message: "Child profile updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getHubContentAdmin = async (req, res) => {
  const items = await HubContent.find().sort({ group: 1, contentType: 1, order: 1 });
  res.json(items);
};

exports.createHubContent = async (req, res) => {
  try {
    const item = await HubContent.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateHubContent = async (req, res) => {
  const item = await HubContent.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ message: "Content not found" });
  res.json(item);
};

exports.deleteHubContent = async (req, res) => {
  await HubContent.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ message: "Deactivated" });
};

// ── New facilitator endpoints ─────────────────────────────────────────────────

const ProgressNote = require("../models/ProgressNote");
const Announcement = require("../models/Announcement");

exports.getChildById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name email phone bookClub createdAt")
      .populate("bookClub.sessionsAttended", "date title bookTitle group");
    if (!user) return res.status(404).json({ message: "Child not found" });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getChildAttendance = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name bookClub.sessionsAttended")
      .populate("bookClub.sessionsAttended", "date title bookTitle group");
    if (!user) return res.status(404).json({ message: "Child not found" });
    res.json(user.bookClub?.sessionsAttended || []);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addProgressNote = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: "Note content is required" });
    const note = await ProgressNote.create({ child: req.params.id, content: content.trim(), createdBy: req.user._id });
    await note.populate("createdBy", "name");
    res.status(201).json(note);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getProgressNotes = async (req, res) => {
  try {
    const notes = await ProgressNote.find({ child: req.params.id })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name");
    res.json(notes);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getSessionById = async (req, res) => {
  try {
    const session = await LearningSession.findById(req.params.id)
      .populate("attendees", "name email bookClub");
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.bulkAttendance = async (req, res) => {
  try {
    const { attendees } = req.body; // [{ userId, attended }]
    const session = await LearningSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    await Promise.all(attendees.map(async ({ userId, attended }) => {
      const user = await User.findById(userId);
      if (!user) return;
      const sid = session._id.toString();
      const uid = userId.toString();
      if (attended) {
        if (!session.attendees.map(String).includes(uid)) session.attendees.push(userId);
        if (!user.bookClub.sessionsAttended.map(String).includes(sid)) {
          user.bookClub.sessionsAttended.push(session._id);
        }
      } else {
        session.attendees = session.attendees.filter(a => a.toString() !== uid);
        user.bookClub.sessionsAttended = user.bookClub.sessionsAttended.filter(
          s => s.toString() !== sid
        );
      }
      await user.save();
    }));
    await session.save();
    res.json({ message: "Attendance saved" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, body, targetGroup } = req.body;
    if (!title || !body) return res.status(400).json({ message: "Title and body are required" });
    const ann = await Announcement.create({
      title, body, targetGroup: targetGroup || "all", createdBy: req.user._id,
    });
    res.status(201).json(ann);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const anns = await Announcement.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(anns);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateAnnouncementStatus = async (req, res) => {
  try {
    const ann = await Announcement.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    );
    if (!ann) return res.status(404).json({ message: "Not found" });
    res.json(ann);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
