const User = require('../models/User');

const getUsers = async (req, res, next) => {
  try {
    const { department, role, search } = req.query;
    const query = {};
    if (department && department !== 'all') query.department = department;
    if (role && role !== 'all') query.role = role;
    if (search) {
      query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    }

    const users = await User.find(query).select('-passwordHash').sort({ name: 1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, role, department, avatar } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (role && req.user.role === 'ADMIN') user.role = role;
    if (department) user.department = department;
    if (avatar) user.avatar = avatar;

    await user.save();
    res.status(200).json({ success: true, message: 'User updated successfully', data: user });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser };
