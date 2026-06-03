const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {pool} = require('../config/db');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Email:", email);
    
    const [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
    console.log("Rows:", rows);
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const admin = rows[0];
    console.log("Entered:", password);
console.log("DB Hash:", admin.password);
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("Match:", isMatch);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, admin: { id: admin.id, email: admin.email } });
  }catch (err) {
  console.error(err);

  res.status(500).json({
    message: 'Server error',
    error: err.message
  });
}
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [rows] = await pool.query('SELECT * FROM admins WHERE id = ?', [req.admin.id]);
    const admin = rows[0];

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE admins SET password = ? WHERE id = ?', [hashed, req.admin.id]);
    res.json({ message: 'Password updated successfully' });
  }catch (err) {
  console.error(err);

  res.status(500).json({
    message: 'Server error',
    error: err.message
  });
}
};
