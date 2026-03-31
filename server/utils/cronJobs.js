import cron from 'node-cron';
import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import sendEmail from './sendEmail.js';

// Setup background tasks
export const initCronJobs = () => {
  // Run every hour to check for upcoming appointments
  cron.schedule('0 * * * *', async () => {
    console.log('Running appointment reminder cron job...');
    try {
      // Find appointments exactly 1 day away
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];

      const upcoming = await Appointment.find({ 
        date: dateString, 
        status: 'confirmed' 
      }).populate('userId doctorId');

      for (const apt of upcoming) {
        if (!apt.userId) continue;

        const existingNotif = await Notification.findOne({
          user: apt.userId._id,
          type: 'reminder',
          message: { $regex: apt._id.toString() } 
        });

        if (!existingNotif) {
          const msg = `Reminder: You have an appointment with ${apt.doctorId.name} tomorrow (${apt.date}) at ${apt.time}. (ID: ${apt._id})`;
          await Notification.create({
            user: apt.userId._id,
            message: msg,
            type: 'reminder'
          });

          await sendEmail({
            email: apt.userId.email,
            subject: 'Appointment Reminder',
            message: msg
          });
        }
      }
    } catch (err) {
      console.error('Error in cron job:', err);
    }
  });
};
