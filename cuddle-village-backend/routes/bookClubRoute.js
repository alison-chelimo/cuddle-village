const router = require("express").Router();
const User = require("../models/User");

// POST /api/book-club/register
// Finds the parent's account by email and saves the child + program details.
// No auth required — looks up by parent.email so non-logged-in parents can also register.
router.post("/register", async (req, res) => {
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

    res.json({ message: "Registration successful", group: program.group });
  } catch (err) {
    console.error("Book club registration error:", err);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

module.exports = router;
