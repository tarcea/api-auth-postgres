const express = require('express');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const cors = require('cors');
const actions = require('./src/actions');
const { sendMail } = require('./src/mailer');
const { passwordGenerator } = require('./src/helpers');
const verifyUser = require('./middlewares');

const PORT = process.env.PORT || 5050;
const secret = process.env.JWT_SECRET;
const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(cors());

app.get('/', (req, res) => {
  res.json({
    documentation: 'https://excited-positive-soldier.glitch.me/docs.html',
  });
});
app.get('/users', verifyUser, async (req, res) => {
  const users = await actions.getAllUsers();
  res.json(users);
});

app.delete('/users/:id', verifyUser, async (req, res) => {
  const { id } = req.params;
  const user = await actions.findById(id);
  if (!user) {
    res.status(404).json({ message: 'no user found' });
    return;
  }
  // await actions.deleteUser(id);
  console.log('delete user with id: ', id);
  res.json({ message: 'user deleted' });
});

app.post('/users/signup', async (req, res) => {
  try {
    const { email, username, password, confirmPassword } = req.body;
    if (!email || !username || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: 'please provide all requested information' });
    }
    const checkEmail = await actions.findByEmail(email);
    const checkUsername = await actions.findByUsername(username);
    if (checkEmail || checkUsername) {
      return res.status(400).json({ message: 'name or email already exists' });
    }
    if (password !== confirmPassword) {
      return res.status(401).json({ message: 'passwords does not match' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await actions.addUser(username, email, hashedPassword);
    const user = await actions.findByEmail(email);
    const token = JWT.sign({}, secret, { expiresIn: 3600 });
    res.status(201).json({ token, userId: user.id, username: user.username });
  } catch (error) {
    res.json({ message: error.message });
  }
});

app.post('/users/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const checkEmail = email && (await actions.findByEmail(email));
    const checkUsername = username && (await actions.findByUsername(username));
    if (!checkEmail && !checkUsername) {
      return res
        .status(401)
        .json({ message: 'wrong authentication credentials' });
    }
    const user = email
      ? await actions.findByEmail(email)
      : await actions.findByUsername(username);
    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      return res
        .status(401)
        .json({ message: 'wrong authentication credentials' });
    }
    const token = JWT.sign({}, secret, { expiresIn: 3600 });
    res.status(200).json({ token, userId: user.id, username: user.username });
  } catch (error) {
    res.json({ message: error.message });
  }
});

app.post('/users/:id/change', async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, password, confirmPassword } = req.body;
    if (!oldPassword || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: 'please provide all requested information' });
    }
    if (password !== confirmPassword) {
      return res.status(401).json({ message: 'passwords does not match' });
    }
    const user = await actions.findById(id);
    const oldPasswordCheck = await bcrypt.compare(password, user.password);
    const passwordCheck = await bcrypt.compare(oldPassword, user.password);
    if (!passwordCheck) {
      return res.status(400).json({ message: 'wrong password' });
    }
    if (oldPasswordCheck) {
      return res
        .status(400)
        .json({ message: 'old password can not be the same with the new one' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await actions.changePassword(hashedPassword, id);
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/users/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await actions.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'no user with this email found' });
    }
    const password = passwordGenerator(12);
    await sendMail(user.email, user.username, password);
    const hashedPassword = await bcrypt.hash(password, 10);
    await actions.changePassword(hashedPassword, user.id);
    console.log(hashedPassword);
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => console.log(`server listening on port ${PORT}`));
