const usersDB = {
  users: require("../model/user.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const handleRefreshToken = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401); //unauthorized
  console.log(cookies.jwt);
  const refreshToken = cookies.jwt;

  const founduser = userDB.users.find(
    (person) => person.refreshToken === refreshToken
  );

  if (!founduser) return res.sendStatus(403); //forbiddern (invalid token)
  //evaluate jwt
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || founduser.username !== decoded.username)
      return res.sendStatus(403);

    const accessToken = jwt.sign(
      { username: decoded.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );

    res.json({
      accessToken,
    });
  });
};

module.exports = { handleRefreshToken };
