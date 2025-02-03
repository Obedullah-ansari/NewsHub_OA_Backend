const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "please provide a name"],
  },
  email: {
    type: String,
    require: [true, "Please provide a email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "please provide a valid email"],
  },
  photo: String,
  password: {
    type: String,
    require: [true, "please enter a password"],
    minlenght: 8,
    select: false,
  },
  passwordConfirmed: {
    type: String,
    require: [true, "please confirm your password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "password dose not match",
    },
  },
  passwordChangedAt: Date,
  PasswordResetToken: String,
  PasswordResetExpire: Date,


});
// run before the document save but dose then work only when the password is modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirmed = undefined;
  next();
});
userSchema.pre("save",  function (next) {
  if (!this.isModified("password") || this.isNew) return next();
 
  this.passwordChangedAt = Date.now()-1000;
  next();
});

// this funtion is avialable on every document that is User(schema)
userSchema.methods.correctpassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JwtTimesstamp) {
  if (this.passwordChangedAt) {
    const changedTimesStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JwtTimesstamp < changedTimesStamp;
  }
  // flase meaning the password is not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
   
  this.PasswordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.PasswordResetExpire = Date.now() + 10 * 60 * 1000;

  return resetToken ;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
