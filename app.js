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
    const checkEmail = await actions.findByEmail(email);
    const checkUsername = await actions.findByUsername(username);
    if (checkEmail || checkUsername) {
      return res.status(400).json({message: 'name or email already exists'})
    }
    if (password !== confirmPassword) {
      return res.status(401).json({message: 'passwords does not match'})
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // const newUser = {email, username, password: hashedPassword};
    await actions.addUser(username, email, hashedPassword);
    const token = JWT.sign({}, secret, {expiresIn: 3600});
    res.status(201).json({ token });
  } catch (error) {
    res.json({message: error.message})
  }
});

app.post('/users/login', (req, res) => {
  const {email, password} = req.body;
  console.log(req.body)
  res.json({email, password})
});

app.listen(PORT, () => console.log(`server listening on port ${PORT}`))
