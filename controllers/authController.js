const usersDB = {
  users: require("../model/user.json"),
  setUsers: function (data) {
    this.users = data;
  },
};
const path = require("path");
const fspromise = require("fs").promises;
const jwt = require("jsonwebtoken");

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

    const accessToken = jwt.sign(
      { username: foundUser.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );

    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    const otherUsers = usersDB.users.filter(
      (person) => person.username !== foundUser.username
    );
    const currentUser = { ...foundUser, refreshToken };
    usersDB.setUsers([...otherUsers, currentUser]);
    await fspromise.writeFile(
      path.join(__dirname, "..", "model", "user.json"),
      JSON.stringify(usersDB.users)
    );
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 100,
    });
    res.json({
      // success: `User ${user} is logged in`,
      accessToken,
    });
  } else {
    res.sendStatus(401);
  }
};

module.exports = { handleLogin };
