const usersDB = {
  users: require("../model/user.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const fspromise = require("fs").promises;
const path = require("path");
const bycrpt = require("bcrypt");

const handleNewUser = async (req, res) => {
  const { user, pwd } = req.body;

  if (!user || !pwd) {
    return res
      .status(400)
      .json({ message: `Username and password are required` });
  }

  const duplicate = usersDB.users.find((person) => person.username === user);
  if (duplicate) return res.sendStatus(409); //conflict

  try {
    const hashedPwd = await bycrpt.hash(pwd, 10);
    const newUser = {
      username: user,
      password: hashedPwd,
    };

    usersDB.setUsers([...usersDB.users, newUser]);
    await fspromise.writeFile(
      path.join(__dirname, "..", "model", "user.json"),
      JSON.stringify(usersDB.users)
    );

    res.status(201).json({ Success: `New user ${user} createed!` });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = { handleNewUser };
