const { createUser, userExists, editUser: editUserService } = require("../../services/user/userServices");
const { comparePassword } = require("../../services/utils/bcrypt");
const { generateToken } = require("../../services/utils/jwt");

const signupUser = async (req, res) => {
  const { email, password, organisation, firstName, lastName } = req.body;
  console.log("Received signup request with email:", email);

  try {
    const existingUser = await userExists(email);
    if (existingUser) {
      console.log(`User ${email} already exists.`);
      return res.status(400).json({ message: "User already exists" });
    }

    if (!email || !password || !organisation || !firstName || !lastName) {
      console.log("Missing required fields in signup request.");
      return res.status(400).json({ message: "Missing required fields" });
    }

    await createUser(email, password, organisation, firstName, lastName);

    console.log(`User ${email} created successfully.`);
    return res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Error in signup:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt for email: ${email}`);

  try {
    const user = await userExists(email);
    console.log(`User not found: ${email}`);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`User found: ${email}, verifying password...`);

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user.email);

    console.log(`Token generated for user: ${email}`);

    delete user.password;

    return res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    console.error("Error in login: ${email}", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const fetchUser = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userExists(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Success",
      user,
    });
  } catch (err) {
    console.error("Error in fetchUser:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const editUser = async (req, res) => {
  const currentUser = req.user; // Sätts av auth-middleware
  const updateData = req.body;
  const targetEmail = currentUser.email;

  try {
    const updatedUser = await editUserService(currentUser, targetEmail, updateData);
    if (updatedUser.password) {
      delete updatedUser.password;
    }
    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error in editUser:", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

module.exports = { signupUser, loginUser, fetchUser, editUser };
