import User from '../models/User.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.isAdmin) {
        return res.status(400).json({ message: 'Cannot delete admin user' });
      }
      await User.deleteOne({ _id: user._id });
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user to admin
// @route   PUT /api/users/:id/admin
// @access  Private/Admin
export const makeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.isAdmin = true;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      if (req.body.email) user.email = req.body.email;
      if (req.body.password) {
        user.password = req.body.password;
      }
      
      // Extended fields
      if (req.body.image !== undefined) user.image = req.body.image;
      if (req.body.age !== undefined) user.age = req.body.age;
      if (req.body.gender !== undefined) user.gender = req.body.gender;
      if (req.body.height !== undefined) user.height = req.body.height;
      if (req.body.weight !== undefined) user.weight = req.body.weight;
      if (req.body.bloodType !== undefined) user.bloodType = req.body.bloodType;
      
      // Arrays
      if (req.body.chronicDiseases !== undefined) user.chronicDiseases = req.body.chronicDiseases;
      if (req.body.allergies !== undefined) user.allergies = req.body.allergies;
      if (req.body.medications !== undefined) user.medications = req.body.medications;
      
      // Objects
      if (req.body.emergencyContact !== undefined) user.emergencyContact = req.body.emergencyContact;
      if (req.body.address !== undefined) user.address = req.body.address;

      const updatedUser = await user.save();

      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
