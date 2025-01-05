const usersDB = {
  users: require("../model/user.json"),
  setUsers: function (data) {
    this.users = data;
  },
};
const path = require("path");
const fsPromises = require("fs").promises;

const handleLogout = async (req, res, next) => {
  //on client, also delete the accessToken

  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  const refreshToken = cookies.jwt;

  // Is refreshToken in db?
  const founduser = usersDB.users.find(
    (person) => person.refreshToken === refreshToken
  );
  if (!founduser) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    return res.sendStatus(204);
  }

  //   Delete refreshToken in db
  const otherUsers = usersDB.users.filter(
    (person) => person.refreshToken !== refreshToken
  );
  const currentUser = {
    ...founduser,
    refreshToken: "",
  };
  usersDB.setUsers([...otherUsers, currentUser]);
  await fsPromises.writeFile(
    path.join(__dirname, "..", "model", "user.json"),
    JSON.stringify(usersDB.users)
  );

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true }); //secure: true - only serves on https
  res.sendStatus(204);
};

module.exports = { handleLogout };
