const MentorNotification = require('../models/MentorNotifications');
const ConnectedMentees = require('../models/ConnectedMentees');

exports.createConnectionRequest = async (req, res) => {
  try {
    const menteeId = req.user._id; // Assuming the mentee's ID is available in req.user
    const { mentorId } = req.params;

    console.log(`Creating connection request from mentee ${menteeId} to mentor ${mentorId}`);

    // Check for existing pending request
    const existingRequest = await MentorNotification.findOne({
      mentor: mentorId,
      mentee: menteeId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'A connection request is already pending' });
    }

    // Create a new notification
    const newNotification = new MentorNotification({
      mentor: mentorId,
      mentee: menteeId,
      message: "A student has requested to connect with you.",
      activeNotification: true,
      status: 'pending'
    });

    await newNotification.save();

    console.log('Connection request notification created:', newNotification);

    res.status(201).json({ message: 'Connection request sent successfully' });
  } catch (error) {
    console.error('Error creating connection request:', error);
    res.status(500).json({ message: 'Error sending connection request', error: error.message });
  }
};



exports.getNotificationsOfMentor = async (req, res) => {
  try {
    const mentorId = req.user._id; // Assuming the mentor's ID is available in req.user
    
    const notifications = await MentorNotification.find({
      mentor: mentorId,
      activeNotification: true
    }).populate('mentee', 'name'); // Populate mentee details

    res.status(200).json({
      message: `You have ${notifications.length} active notifications`,
      notifications: notifications
    });
  } catch (error) {
    console.error('Error fetching mentor notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

exports.updateNotificationStatus = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { action } = req.body;

    if (!['accepted', 'rejected', 'dismissed'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const notification = await MentorNotification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (action === 'accepted') {
      // Add mentee to ConnectedMentees
      const connectedMentees = await ConnectedMentees.findOneAndUpdate(
        { mentor: notification.mentor },
        { $addToSet: { mentees: notification.mentee } },
        { upsert: true, new: true }
      );

      // Delete the notification
      await MentorNotification.findByIdAndDelete(notificationId);

      res.status(200).json({ message: 'Connection request accepted and mentee added to connected list' });
    } else if (action === 'rejected') {
      // Delete the notification
      await MentorNotification.findByIdAndDelete(notificationId);

      res.status(200).json({ message: 'Connection request rejected' });
    } else if (action === 'dismissed') {
      // Update the notification to be inactive
      notification.activeNotification = false;
      await notification.save();

      res.status(200).json({ message: 'Notification dismissed' });
    }
  } catch (error) {
    console.error('Error updating notification status:', error);
    res.status(500).json({ message: 'Error updating notification status', error: error.message });
  }
};