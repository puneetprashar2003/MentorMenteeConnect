// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const mentorProfileRoutes = require('./routes/mentorProfileRoutes');
const menteeProfileRoutes = require('./routes/menteeProfileRoutes');
const matchRoutes = require('./routes/matchRoutes');
const connectedStudentsRoutes = require('./routes/connectedStudentsRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Could not connect to MongoDB', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mentor/profile', mentorProfileRoutes);
app.use('/api/mentee/profile', menteeProfileRoutes);
app.use('/api/match', matchRoutes);
const notificationRoutes = require('./routes/mentorNotificationRoutes');
app.use('/api/notifications', notificationRoutes);
app.use('/api/connected-students', connectedStudentsRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});