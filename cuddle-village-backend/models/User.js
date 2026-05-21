const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    phone: String,
    role: {
        type: String,
        enum: ["user", "admin", "facilitator"],
        default: "user"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    loyaltyPoints:  { type: Number, default: 0 },
    lifetimePoints: { type: Number, default: 0 },
    loyaltyTier:    { type: String, enum: ["Bronze", "Silver", "Gold", "Platinum"], default: "Bronze" },
    bookClub: {
        childName: String,
        childAge: Number,
        dob: Date,
        school: String,
        allergies: String,
        specialNeeds: String,
        schedule: String,
        plan: String,
        emergencyContact: String,
        group: {
            type: String,
            enum: ["early-learners", "growing-readers", "group3"]
        },
        sessionsAttended: [{ type: require("mongoose").Schema.Types.ObjectId, ref: "LearningSession" }],
        booksRead:  [{ title: String, completedAt: Date }],
        skills:     [{ name: String, achievedAt: Date }],
        notes:      String,
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);