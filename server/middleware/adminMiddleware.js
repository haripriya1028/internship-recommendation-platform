/*const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin only",
    });
  }

  next();
};

module.exports = { isAdmin };*/

const isAdmin = (req, res, next) => {

  console.log("REQ.USER:", req.user);

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin only",
    });
  }

  next();
};

module.exports = { isAdmin };