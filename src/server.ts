import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import Order from './models/Order';
import WholesaleOrder from './models/WholesaleOrder';
import User from './models/User';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Socket client connected:', socket.id);

  socket.on('updateLocation', async (data) => {
    try {
      const { userId, latitude, longitude, isTrackingEnabled } = data;
      if (!userId) return;

      const user = await User.findById(userId);
      if (!user) return;

      if (latitude !== undefined) user.latitude = latitude;
      if (longitude !== undefined) user.longitude = longitude;
      if (isTrackingEnabled !== undefined) user.isTrackingEnabled = isTrackingEnabled;
      user.lastLocationUpdate = new Date();

      await user.save();

      // Broadcast live coordinates to all active admin clients in real-time
      io.emit('locationUpdated', {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        staffPosition: user.staffPosition,
        latitude: user.latitude,
        longitude: user.longitude,
        isTrackingEnabled: user.isTrackingEnabled,
        lastLocationUpdate: user.lastLocationUpdate
      });
    } catch (err) {
      console.error('Socket updateLocation error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket client disconnected:', socket.id);
  });
});

const startTrashPurgeScheduler = () => {
  const purgeExpiredTrash = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      console.log(`[Trash Purge Cron] Checking for soft-deleted records older than ${thirtyDaysAgo.toISOString()}...`);
      
      const deletedRetail = await Order.deleteMany({
        isDeleted: true,
        deletedAt: { $lte: thirtyDaysAgo }
      });
      
      const deletedWholesale = await WholesaleOrder.deleteMany({
        isDeleted: true,
        deletedAt: { $lte: thirtyDaysAgo }
      });
      
      if (deletedRetail.deletedCount > 0 || deletedWholesale.deletedCount > 0) {
        console.log(`[Trash Purge Cron] Purged ${deletedRetail.deletedCount} retail orders and ${deletedWholesale.deletedCount} wholesale orders from trash.`);
      } else {
        console.log(`[Trash Purge Cron] No expired records found to purge.`);
      }
    } catch (err) {
      console.error('[Trash Purge Cron] Error executing purge scheduler:', err);
    }
  };

  // Run initial check after 5 seconds to let the DB connect
  setTimeout(purgeExpiredTrash, 5000);
  
  // Set up 24-hour interval
  setInterval(purgeExpiredTrash, 24 * 60 * 60 * 1000);
};

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startTrashPurgeScheduler();
});
