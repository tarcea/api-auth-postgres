const express = require('express');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const actions = require('./src/actions');

const PORT = process.env.PORT || 5050;
const secret = process.env.JWT_SECRET;
const app = express();
app.use(express.json());

app.get('/users', async (req, res) => {
  const users = await actions.getAllUsers()
  res.json(users)
});

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  await actions.deleteUser(id)
  res.json({message: 'user deleted'})
});

app.post('/users/signup', async (req, res) => {
  try {
    const {email, username, password, confirmPassword} = req.body;
    if (!email || !username || !password || !confirmPassword) {
      return res.status(400).json({message: 'please provide all requested information'});
    }
    const checkEmail = await actions.findByEmail(email);
    const checkUsername = await actions.findByUsername(username);
    if (checkEmail || checkUsername) {
      return res.status(400).json({message: 'name or email already exists'})
    }
    if (password !== confirmPassword) {
      return res.status(401).json({message: 'passwords does not match'})
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await actions.addUser(username, email, hashedPassword);
    const user = await actions.findByEmail(email);
    const token = JWT.sign({}, secret, {expiresIn: 3600});
    res.status(201).json({ token, userId: user.id });
  } catch (error) {
    res.json({message: error.message})
  }
});

app.post('/users/login', async (req, res) => {
  try {
    const {email, username, password} = req.body;
    const checkEmail = email && await actions.findByEmail(email);
    const checkUsername = username && await actions.findByUsername(username);
    if (!checkEmail && !checkUsername) {
      return res.status(401).json({message: 'wrong authentication credentials'})
    }
    const user = email ? await actions.findByEmail(email) : await actions.findByUsername(username);
    const passwordCheck = await bcrypt.compare(password, user.password)
    if (!passwordCheck) {
      return res.status(401).json({message: 'wrong authentication credentials'})
    }
    const token = JWT.sign({}, secret, {expiresIn: 3600});
    res.status(201).json({ token, userId: user.id });
  } catch (error) {
    res.json({message: error.message})
  }
});

app.post('/users/:id/change', async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(401).json({message: 'passwords does not match'})
    }
    if (!oldPassword || !password || !confirmPassword) {
      return res.status(400).json({message: 'please provide all requested information'});
    }
    const user = await actions.findById(id);
    const oldPasswordCheck = await bcrypt.compare(password, user.password);
    if (oldPasswordCheck) {
      return res.status(400).json({message: 'old password can not be the same with the new one'});
    }
    const passwordCheck = await bcrypt.compare(oldPassword, user.password);
    if (!passwordCheck) {
      return res.status(400).json({message: 'wrong password'})
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await actions.changePassword(hashedPassword, id);
    res.status(204).json()
  } catch (error) {
    res.json({message: error.message})
  }
})

app.listen(PORT, () => console.log(`server listening on port ${PORT}`))
