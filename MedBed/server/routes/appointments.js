const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const Hospital = require('../models/Hospital');

router.get('/', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id })
      .populate('hospital', 'name location');
    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    const hospital = await Hospital.findById(appointment.hospital);
    hospital.bedsAvailable += appointment.beds;
    await hospital.save();
    await appointment.remove();

    res.json({ success: true, msg: 'Appointment cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

module.exports = router;
