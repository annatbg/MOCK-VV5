const {
  createUser,
  userExists,
  editUserService,
} = require("../../services/user/userServices");
const { comparePassword } = require("../../services/utils/bcrypt");
const { generateToken } = require("../../services/utils/jwt");

/**
 * SIGNUP
 * Förväntar sig att event.body är ett JSON-objekt med: email, password, organisation, firstName, lastName.
 */
const signupUser = async (event) => {
  try {
    const { email, password, organisation, firstName, lastName } = JSON.parse(
      event.body
    );
    console.log("Received signup request with email:", email);

    // Kolla om användaren redan finns
    const existingUser = await userExists(email);
    if (existingUser) {
      console.log(`User ${email} already exists.`);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "User already exists" }),
      };
    }

    // Kolla att alla fält finns
    if (!email || !password || !organisation || !firstName || !lastName) {
      console.log("Missing required fields in signup request.");
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    await createUser(email, password, organisation, firstName, lastName);

    console.log(`User ${email} created successfully.`);
    return {
      statusCode: 201,
      body: JSON.stringify({ message: "User created successfully" }),
    };
  } catch (err) {
    console.error("Error in signup:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};

/**
 * LOGIN
 * Förväntar sig att event.body är ett JSON-objekt med: email, password.
 */
const loginUser = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);
    console.log(`Login attempt for email: ${email}`);

    const user = await userExists(email);
    // Om användaren inte hittas
    if (!user) {
      console.log(`User not found: ${email}`);
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    console.log(`User found: ${email}, verifying password...`);

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      console.log(`Invalid password for user: ${email}`);
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid credentials" }),
      };
    }

    const token = generateToken(user.email);
    console.log(`Token generated for user: ${email}`);

    // Ta bort lösenordet ur user-objektet innan svaret skickas
    delete user.password;

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Login successful",
        token,
        user,
      }),
    };
  } catch (err) {
    console.error("Error in login:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};

/**
 * FETCH USER
 * Förväntar sig att event.body innehåller { email }
 */
const fetchUser = async (event) => {
  try {
    const { email } = JSON.parse(event.body);
    const user = await userExists(email);
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Success",
        user,
      }),
    };
  } catch (err) {
    console.error("Error in fetchUser:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};

/**
 * EDIT USER
 * Förväntar sig att event.body innehåller uppdateringsdata.
 * Användaren hämtas från tokeninformation, där vi antar att event.requestContext.authorizer innehåller användarens info,
 * t.ex. { username: "user@example.com" }.
 */
const editUser = async (event) => {
  try {
    // Hämta inloggad användare från din JWT-authorizer
    const currentUser = event.requestContext?.authorizer;
    const updateData = JSON.parse(event.body);
    // Anta att username är samma som den e-postadress vi använder
    const targetEmail = currentUser.username;

    const updatedUser = await editUserService(
      currentUser,
      targetEmail,
      updateData
    );
    const newToken = generateToken(updatedUser.email);

    if (updatedUser.password) {
      delete updatedUser.password;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User updated successfully",
        user: updatedUser,
        token: newToken,
      }),
    };
  } catch (err) {
    console.error("Error in editUser:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message || "Internal server error" }),
    };
  }
};

module.exports = { signupUser, loginUser, fetchUser, editUser };
