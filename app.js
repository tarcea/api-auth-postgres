const express = require('express');
const actions = require('./src/actions');

const PORT = process.env.PORT || 5050;
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

app.post('/users/signup', (req, res) => {
  const {email, username, password, confirmPassword} = req.body;
  console.log(req.body)
  res.json({email, password})
});

app.post('/users/login', (req, res) => {
  const {email, password} = req.body;
  console.log(req.body)
  res.json({email, password})
});

app.listen(PORT, () => console.log(`server listening on port ${PORT}`))
