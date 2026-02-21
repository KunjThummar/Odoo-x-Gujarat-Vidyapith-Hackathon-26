const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/vehicles', require('./routes/vehicle.routes'));
app.use('/api/trips', require('./routes/trip.routes'));
app.use('/api/drivers', require('./routes/driver.routes'));
app.use('/api/maintenance', require('./routes/maintenance.routes'));
app.use('/api/fuel', require('./routes/fuel.routes'));
app.use('/api/expenses', require('./routes/expense.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/dispatchers', require('./routes/dispatcher.routes'));
app.use('/api/users', require('./routes/user.routes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'FleetFlow API Running', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 FleetFlow Server running on port ${PORT}`);
});
