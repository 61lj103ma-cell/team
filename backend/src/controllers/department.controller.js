const Department = require('../models/Department');
const Incident = require('../models/Incident');
const User = require('../models/User');

const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('members', 'name email role avatar').sort({ name: 1 });

    // Attach incident count to each department
    const enriched = await Promise.all(
      departments.map(async (dept) => {
        const incidentCount = await Incident.countDocuments({ department: new RegExp(`^${dept.name}`, 'i') });
        const criticalCount = await Incident.countDocuments({
          department: new RegExp(`^${dept.name}`, 'i'),
          severity: 'Critical',
          status: { $nin: ['Resolved', 'Closed'] },
        });
        const memberCount = await User.countDocuments({ department: dept.name });

        return {
          ...dept.toObject(),
          incidentCount,
          criticalCount,
          memberCount,
        };
      })
    );

    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    next(err);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Department already exists' });
    }

    const dept = await Department.create({ name, description });
    res.status(201).json({ success: true, message: 'Department created', data: dept });
  } catch (err) {
    next(err);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.status(200).json({ success: true, message: 'Department updated', data: dept });
  } catch (err) {
    next(err);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.status(200).json({ success: true, message: 'Department deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment };
