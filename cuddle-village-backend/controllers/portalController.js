const mongoose        = require("mongoose");
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
  const VALID_GROUPS = ["early-learners", "growing-readers"];
  const group = VALID_GROUPS.includes(req.params.group) ? req.params.group : null;
  if (!group) return res.status(400).json({ message: "Invalid group" });
  const items = await HubContent.find({ group: { $eq: group }, isActive: true }).sort({ order: 1, createdAt: 1 });
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
  const VALID_GROUPS = ["early-learners", "growing-readers"];
  const filter = req.query.group && VALID_GROUPS.includes(req.query.group)
    ? { group: { $eq: req.query.group } }
    : {};
  const sessions = await LearningSession.find(filter)
    .sort({ date: -1 })
    .populate("attendees", "name email bookClub");
  res.json(sessions);
};

exports.createSession = async (req, res) => {
  try {
    const { date, group, title, bookTitle, bookAuthor, activityDescription, facilitatorNotes } = req.body;
    const VALID_GROUPS = ["early-learners", "growing-readers"];
    if (group && !VALID_GROUPS.includes(group)) {
      return res.status(400).json({ message: "Invalid group" });
    }
    const session = await LearningSession.create({
      date,
      group,
      title:               title               !== undefined ? String(title)               : undefined,
      bookTitle:           bookTitle           !== undefined ? String(bookTitle)           : undefined,
      bookAuthor:          bookAuthor          !== undefined ? String(bookAuthor)          : undefined,
      activityDescription: activityDescription !== undefined ? String(activityDescription) : undefined,
      facilitatorNotes:    facilitatorNotes    !== undefined ? String(facilitatorNotes)    : undefined,
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateSession = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Session not found" });
  }
  const { date, group, title, bookTitle, bookAuthor, activityDescription, facilitatorNotes } = req.body;
  const VALID_GROUPS = ["early-learners", "growing-readers"];
  const isStringField = (value) => typeof value === "string";

  const update = {};

  if (date !== undefined) {
    if (!isStringField(date)) return res.status(400).json({ message: "Invalid date" });
    update.date = date;
  }
  if (group !== undefined) {
    if (!isStringField(group) || !VALID_GROUPS.includes(group)) {
      return res.status(400).json({ message: "Invalid group" });
    }
    update.group = group;
  }
  if (title !== undefined) {
    if (!isStringField(title)) return res.status(400).json({ message: "Invalid title" });
    update.title = title;
  }
  if (bookTitle !== undefined) {
    if (!isStringField(bookTitle)) return res.status(400).json({ message: "Invalid bookTitle" });
    update.bookTitle = bookTitle;
  }
  if (bookAuthor !== undefined) {
    if (!isStringField(bookAuthor)) return res.status(400).json({ message: "Invalid bookAuthor" });
    update.bookAuthor = bookAuthor;
  }
  if (activityDescription !== undefined) {
    if (!isStringField(activityDescription)) {
      return res.status(400).json({ message: "Invalid activityDescription" });
    }
    update.activityDescription = activityDescription;
  }
  if (facilitatorNotes !== undefined) {
    if (!isStringField(facilitatorNotes)) {
      return res.status(400).json({ message: "Invalid facilitatorNotes" });
    }
    update.facilitatorNotes = facilitatorNotes;
  }

  const session = await LearningSession.findByIdAndUpdate(
    new mongoose.Types.ObjectId(req.params.id),
    update,
    { new: true }
  );
  if (!session) return res.status(404).json({ message: "Session not found" });
  res.json(session);
};

exports.markAttendance = async (req, res) => {
  try {
    const { userId, attended } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const session = await LearningSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const user = await User.findById(new mongoose.Types.ObjectId(userId));
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
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(404).json({ message: "User not found" });
    }
    const { notes, skills, booksRead } = req.body;
    const user = await User.findById(new mongoose.Types.ObjectId(req.params.userId));
    if (!user) return res.status(404).json({ message: "User not found" });

    if (notes     !== undefined) user.bookClub.notes     = String(notes);
    if (skills    !== undefined) user.bookClub.skills    = skills;
    if (booksRead !== undefined) user.bookClub.booksRead = booksRead;

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
    const { group, contentType, title, author, emoji, tag, description, weekLabel, isActive, order } = req.body;
    const VALID_GROUPS = ["early-learners", "growing-readers"];
    const VALID_TYPES  = ["book", "activity", "milestone"];
    if (group && !VALID_GROUPS.includes(group)) return res.status(400).json({ message: "Invalid group" });
    if (contentType && !VALID_TYPES.includes(contentType)) return res.status(400).json({ message: "Invalid contentType" });
    const item = await HubContent.create({
      group, contentType,
      title:       title       !== undefined ? String(title)       : undefined,
      author:      author      !== undefined ? String(author)      : undefined,
      emoji:       emoji       !== undefined ? String(emoji)       : undefined,
      tag:         tag         !== undefined ? String(tag)         : undefined,
      description: description !== undefined ? String(description) : undefined,
      weekLabel:   weekLabel   !== undefined ? String(weekLabel)   : undefined,
      isActive:    isActive    !== undefined ? Boolean(isActive)   : undefined,
      order:       order       !== undefined ? Number(order)       : undefined,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateHubContent = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Content not found" });
  }
  const { group, contentType, title, author, emoji, tag, description, weekLabel, isActive, order } = req.body;
  const VALID_GROUPS = ["early-learners", "growing-readers"];
  const VALID_TYPES  = ["book", "activity", "milestone"];
  if (group       !== undefined && !VALID_GROUPS.includes(group))       return res.status(400).json({ message: "Invalid group" });
  if (contentType !== undefined && !VALID_TYPES.includes(contentType))  return res.status(400).json({ message: "Invalid contentType" });

  // Use findById + save() so user values go through Mongoose schema validation
  // rather than a raw MongoDB update-doc argument (avoids CodeQL taint into query).
  const item = await HubContent.findById(new mongoose.Types.ObjectId(req.params.id));
  if (!item) return res.status(404).json({ message: "Content not found" });

  if (group       !== undefined) item.group       = VALID_GROUPS[VALID_GROUPS.indexOf(group)];
  if (contentType !== undefined) item.contentType = VALID_TYPES[VALID_TYPES.indexOf(contentType)];
  if (title       !== undefined) item.title       = String(title);
  if (author      !== undefined) item.author      = String(author);
  if (emoji       !== undefined) item.emoji       = String(emoji);
  if (tag         !== undefined) item.tag         = String(tag);
  if (description !== undefined) item.description = String(description);
  if (weekLabel   !== undefined) item.weekLabel   = String(weekLabel);
  if (isActive    !== undefined) item.isActive    = Boolean(isActive);
  if (order       !== undefined) item.order       = Number(order);

  const updated = await item.save();
  res.json(updated);
};

exports.deleteHubContent = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Content not found" });
  }
  await HubContent.findByIdAndUpdate(new mongoose.Types.ObjectId(req.params.id), { isActive: false });
  res.json({ message: "Deactivated" });
};

// ── New facilitator endpoints ─────────────────────────────────────────────────

const ProgressNote = require("../models/ProgressNote");
const Announcement = require("../models/Announcement");

exports.getChildById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: "Child not found" });
    const user = await User.findById(new mongoose.Types.ObjectId(req.params.id))
      .select("name email phone bookClub createdAt")
      .populate("bookClub.sessionsAttended", "date title bookTitle group");
    if (!user) return res.status(404).json({ message: "Child not found" });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getChildAttendance = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: "Child not found" });
    const safeId = new mongoose.Types.ObjectId(req.params.id);
    const user = await User.findOne({ _id: { $eq: safeId } })
      .select("name bookClub.sessionsAttended")
      .populate("bookClub.sessionsAttended", "date title bookTitle group");
    if (!user) return res.status(404).json({ message: "Child not found" });
    res.json(user.bookClub?.sessionsAttended || []);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addProgressNote = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: "Child not found" });
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: "Note content is required" });
    const safeId = new mongoose.Types.ObjectId(req.params.id);
    const note = await ProgressNote.create({ child: safeId, content: String(content).trim(), createdBy: req.user._id });
    await note.populate("createdBy", "name");
    res.status(201).json(note);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getProgressNotes = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: "Child not found" });
    const notes = await ProgressNote.find({ child: new mongoose.Types.ObjectId(req.params.id) })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name");
    res.json(notes);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getSessionById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: "Session not found" });
    const session = await LearningSession.findById(new mongoose.Types.ObjectId(req.params.id))
      .populate("attendees", "name email bookClub");
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.bulkAttendance = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: "Session not found" });
    const { attendees } = req.body; // [{ userId, attended }]
    const session = await LearningSession.findById(new mongoose.Types.ObjectId(req.params.id));
    if (!session) return res.status(404).json({ message: "Session not found" });

    await Promise.all(attendees.map(async ({ userId, attended }) => {
      if (!mongoose.Types.ObjectId.isValid(userId)) return;
      const user = await User.findById(new mongoose.Types.ObjectId(userId));
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
    const VALID_GROUPS = ["early-learners", "growing-readers", "all"];
    const safeGroup = VALID_GROUPS.includes(targetGroup) ? targetGroup : "all";
    const ann = await Announcement.create({
      title: String(title), body: String(body), targetGroup: safeGroup, createdBy: req.user._id,
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const VALID_STATUSES = ["draft", "sent"];
    if (!VALID_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const safeId = new mongoose.Types.ObjectId(req.params.id);
    const safeStatus = req.body.status === "sent" ? "sent" : "draft";
    const ann = await Announcement.findByIdAndUpdate(
      safeId, { status: safeStatus }, { new: true }
    );
    if (!ann) return res.status(404).json({ message: "Not found" });
    res.json(ann);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
