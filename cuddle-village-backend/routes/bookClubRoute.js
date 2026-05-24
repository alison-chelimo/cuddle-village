const router           = require("express").Router();
const User             = require("../models/User");
const { createTransporter }        = require("../utils/sendEmail");
const { bookClubConfirmationEmail } = require("../utils/emailTemplates");
const { bookClubLimiter }          = require("../middleware/rateLimiter");

// POST /api/book-club/register
// Finds the parent's account by email and saves the child + program details.
// No auth required — looks up by parent.email so non-logged-in parents can also register.
router.post("/register", bookClubLimiter, async (req, res) => {
  try {
    const { child, parent, program } = req.body;

    if (!child || !parent || !program) {
      return res.status(400).json({ message: "Incomplete registration data" });
    }

    const user = await User.findOne({ email: parent.email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        message: "No account found for this email. Please create an account first."
      });
    }

    user.bookClub = {
      childName:        child.name,
      childAge:         child.age,
      dob:              child.dob || undefined,
      school:           child.school,
      allergies:        child.allergies,
      specialNeeds:     child.specialNeeds,
      emergencyContact: parent.emergencyContact,
      schedule:         program.schedule,
      plan:             program.plan,
      group:            program.group,
    };

    if (!user.phone && parent.phone) {
      user.phone = parent.phone;
    }

    await user.save();

    // Send confirmation email — fire-and-forget so a mail failure never blocks the response
    createTransporter().sendMail({
      from: `"The Cuddle Village" <${process.env.EMAIL_USER}>`,
      to:   parent.email,
      subject: `Book Club registration confirmed — ${child.name} is enrolled!`,
      text:  `Hi ${parent.name}, ${child.name} has been registered for the ${program.group} group. We'll be in touch with session details soon.`,
      html:  bookClubConfirmationEmail(child, parent, program),
    }).catch(err => console.error("Book club confirmation email failed:", err.message));

    res.json({ message: "Registration successful", group: program.group });
  } catch (err) {
    console.error("Book club registration error:", err);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

module.exports = router;
