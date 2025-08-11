const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true, 
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.log("❌ MongoDB connection error:", err);
  }
};

// SCHEMAS
const CommonSchema = new mongoose.Schema({
  name: String,
  types: [String],
  link: String,
  devfolio_link: String,
  external_links: [String],
  tags: [String],
  last_updated: {
    type: Date,
    default: Date.now,
  },
}, { strict: false }); // Allows flexible fields

// Clist Contest Schema
const ClistContestSchema = new mongoose.Schema({
  name: String,
  platform: String,
  start: String,
  end: String,
  duration: String,
  link: String,
  host: String,
  id: Number,
  last_updated: Date,
}, { strict: false });

// User Interest Schema
const UserInterestSchema = new mongoose.Schema({
  opportunityId: String,
  opportunityType: String, // 'hackathon' or 'contest'
  opportunityName: String,
  platform: String,
  link: String,
  deadline: String,
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Job Application Schema
const JobApplicationSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  applicationDate: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ['applied', 'interview', 'rejected', 'accepted', 'pending'],
    default: 'applied'
  },
  sourceUrl: String,
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// User Schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ""
  },
  interests: [UserInterestSchema], // Array of user interests
  jobApplications: [JobApplicationSchema], // Array of job applications
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // Skip if password not changed
  try {
    const salt = await bcrypt.genSalt(10); // Generate salt for hashing
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next(); // Proceed with save
  } catch (error) {
    next(error); // Pass error to next middleware
  }
});


// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// MODELS
const OpenHackathon = mongoose.model("open_hackathons", CommonSchema);
const ClosedHackathon = mongoose.model("closed_hackathons", CommonSchema);
const UpcomingHackathon = mongoose.model("upcoming_hackathons", CommonSchema);
const ClistContest = mongoose.model("clist_contests", ClistContestSchema);
const User = mongoose.model("users", UserSchema);
const JobApplication = mongoose.model("job_applications", JobApplicationSchema);

// IndeedJobs Model
let IndeedJob;
try {
  IndeedJob = mongoose.model("indeedjobs");
} catch (error) {
  IndeedJob = mongoose.model("indeedjobs", new mongoose.Schema({}, { strict: false }));
}

module.exports = {
  connectDB,
  OpenHackathon,
  ClosedHackathon,
  UpcomingHackathon,
  ClistContest,
  User,
  JobApplication,
  IndeedJob
}; 