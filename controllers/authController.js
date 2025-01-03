const usersDB = {
  users: require("../model/user.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const bycrpt = require("bcrypt");

const handleLogin = async (req, res) => {
  const { user, pwd } = req.body;

  if (!user || !pwd) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  const foundUser = usersDB.users.find((person) => person.username === user);
  if (!foundUser) return res.sendStatus(401); //unauthorized

  const match = await bycrpt.compare(pwd, foundUser.password);

  if (match) {
    //Create JWTs
    res.json({
      success: `User ${user} is logged in`,
    });
  } else {
    res.sendStatus(401);
  }
};

module.exports = { handleLogin };
