// backend/controllers/authController.js
import User from '../models/User.js';
import Student from '../models/Student.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateCBCContent } from '../utils/gemini.js';

// Register
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  const { classes, subjects } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.classes = classes || user.classes;
    user.subjects = subjects || user.subjects;
    await user.save();

    res.json({ msg: 'Profile updated', user: { id: user.id, classes: user.classes, subjects: user.subjects } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

export const addStudent = async (req, res) => {
  const { name, class: studentClass, subject, performance } = req.body;
  try {
    let student = await Student.findOne({ name, class: studentClass, subject, teacher: req.user.id });
    if (student) {
      student.performance = performance !== undefined ? performance : student.performance;
      await student.save();
      return res.json({ msg: 'Student updated', student });
    }

    student = new Student({ name, class: studentClass, subject, performance, teacher: req.user.id });
    await student.save();
    res.status(201).json({ msg: 'Student added', student });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find({ teacher: req.user.id });
    res.json(students);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

export const generateContent = async (req, res) => {
  const { type, grade, subject, topic } = req.body;

  if (!type || !grade || !subject) {
    return res.status(400).json({ error: 'Grade, subject, and type are required' });
  }

  try {
    const result = await generateCBCContent({ type, grade, subject, topic: topic || '' });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      content: result.content,
      generatedAt: result.generatedAt,
      model: "gemini-2.5-flash"
    });
  } catch (err) {
    console.error('Gemini Error:', err);
    res.status(500).json({ error: 'AI generation failed' });
  }
};

export const getRecommendations = async (req, res) => {
  const { studentId } = req.body;
  try {
    const student = await Student.findById(studentId);
    if (!student || student.teacher.toString() !== req.user.id.toString()) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    let recs = '';
    if (student.performance < 70) {
      recs = `Remedial for ${student.name}: Use interactive videos on ${student.subject} basics. Focus: Communication competency.`;
    } else {
      recs = `Advanced for ${student.name}: Challenge questions on ${student.subject}. Focus: Creativity competency.`;
    }
    res.json({ recommendations: recs });
  } catch (err) {
    res.status(500).json({ msg: 'Recommendation error' });
  }
};

// === EXPORT ALL FUNCTIONS ===
// module.exports = {
//   register,
//   login,
//   getMe,
//   updateProfile,
//   getProfile,
//   addStudent,
//   getStudents,
//   generateContent,
//   getRecommendations
// };