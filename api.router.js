const express = require("express");
const apiRouter = express.Router();
const { registerUser, loginUser } = require("./controllers/auth.controller");
const { validateToken } = require("./middleware/authMiddleware");

apiRouter.get("/", (req, res) => {
    return res.send("Bienvenido al api");
});

apiRouter.post("/auth/register", registerUser);
apiRouter.post("/auth/login", loginUser);
// Logout de usuario
apiRouter.post('/auth/logout', logout);

apiRouter.use("/usuarios", validateToken, require("./routes/user.route"));

module.exports = apiRouter;