const serverless = require("serverless-http");
const express = require("express");
const app = express();
app.use(express.json());
const { auth } = require("./services/utils/auth");

// Import controllers (endpoint logic)
const userController = require("./controllers/user/userController");
const notFoundController = require("./controllers/notFoundController");
const demandController = require("./controllers/demand/demandController");

// CORS Middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Routes
app.post("/signup", userController.signupUser);
app.post("/login", userController.loginUser);
app.post("/demand", auth, demandController.createDemand);
app.get("/demand", auth, demandController.fetchMyDemands);
app.get("/demands/all", demandController.fetchAllDemands);
app.delete("/demand/:demandId", auth, demandController.deleteDemand);

app.post("/user/fetch", userController.fetchUser);

// Catch-all for 404 errors
app.use(notFoundController.error);

exports.handler = serverless(app);
