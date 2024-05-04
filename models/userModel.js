const crypto = require('node:crypto');

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please tell us your name!'],
    minLength: [3, 'name should be more than 3 characters'],
    maxLength: [40, 'name should be less than 40 characters'],
  },

  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, 'Please provide your email!'],
    validate: [validator.isEmail, 'Please provide a valid email!'],
  },

  photo: { type: String, default: 'default.jpg' },

  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },

  password: {
    type: String,
    required: [true, 'Please provide your password!'],
    minLength: [8, 'A password should be more than 8 characters'],
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (val) {
        return val === this.password;
      },
      message: 'password and confirm password are not the same',
    },
  },

  passwordLastChangedAt: Date,

  passwordResetToken: String,
  passwordResetExpires: Date,

  active: {
    type: Boolean,
    default: true,
    select: false,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
    // select: false, -- never be included in projection
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field - mangoose will not persist it in DB if it is set to be undefined
  // passwordConfirm in schema is required input not that it's required to actually be persisted in DB
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.$isNew) return next();

  this.passwordLastChangedAt = Date.now() - 1000;

  next();
});

// QUERY MIDDLEWARE
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });

  next();
});

// INSTANCE METHOD - will only work on instance object created by User.model
// So, 'this' keyword will points on the instance of that model
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  // this.password is not available because we made password field is unselected field in userSchema

  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTIssueTimestamp) {
  if (this.passwordLastChangedAt) {
    const lastChangedTimestamp = parseInt(
      this.passwordLastChangedAt.getTime() / 1000,
      10,
    );

    return JWTIssueTimestamp < lastChangedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // expire the token in 10mins
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
