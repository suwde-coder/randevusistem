import Specialty from '../models/Specialty.js';

export const getSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.find({});
    res.json(specialties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSpecialty = async (req, res) => {
  try {
    const { name, description } = req.body;
    const specialty = await Specialty.create({ name, description });
    res.status(201).json(specialty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSpecialty = async (req, res) => {
  try {
    await Specialty.findByIdAndDelete(req.params.id);
    res.json({ message: 'Specialty removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
