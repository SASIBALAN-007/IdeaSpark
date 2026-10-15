import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Separate collection: "investors"
const investorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    firmName: { type: String, trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      // Never return the password hash in query results by default
      select: false,
    },
    investmentFocus: { type: String, trim: true },
    // Fixed role used for the JWT payload and authorization checks
    role: { type: String, default: "investor", immutable: true },
  },
  { timestamps: true }
);

// Hash the password before saving (only when it has been modified).
// Mongoose 9: async middleware without `next`; returning resolves the hook.
investorSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare a plain-text password with the stored hash
investorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Investor = mongoose.model("Investor", investorSchema);
export default Investor;
 