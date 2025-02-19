require("dotenv").config();
const { GetCommand, PutCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const db = require("../../services/db/db");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const TABLE_NAME = process.env.DB_TABLE_USERS;

const userExists = async (email) => {
  const getParams = {
    TableName: TABLE_NAME,
    Key: { email },
  };

  try {
    const existingUser = await db.send(new GetCommand(getParams));
    console.log(`User ${email} exists:`, existingUser.Item);
    return existingUser.Item;
  } catch (err) {
    console.error("Error checking if user exists:", err);
    throw new Error("Error checking if user exists");
  }
};

const createUser = async (
  email,
  password,
  organisation,
  firstName,
  lastName
) => {
  console.log(`Creating new user with email: ${email}`);
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(`Password hashed for user ${email}`);

  const newUser = {
    userId: uuidv4(),
    email,
    password: hashedPassword,
    organisation,
    firstName,
    lastName,
    role: "client",
  };

  const putParams = {
    TableName: TABLE_NAME,
    Item: newUser,
  };

  try {
    await db.send(new PutCommand(putParams));
    console.log(`User ${email} successfully created.`);
  } catch (err) {
    console.error("Error creating user:", err);
    throw new Error("Error creating user");
  }
};

const editUser = async (currentUser, targetEmail, updateData) => {
  
  if (
    currentUser.email !== targetEmail &&
    currentUser.role !== "developer" &&
    currentUser.role !== "admin"
  ) {
    throw new Error("Not authorized to edit this user");
  }

  const existingUser = await userExists(targetEmail);
  if (!existingUser) {
    throw new Error("User does not exist");
  }

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  let newEmail = targetEmail;
  if (updateData.email && updateData.email !== targetEmail) {
    const userWithNewEmail = await userExists(updateData.email);
    if (userWithNewEmail) {
      throw new Error("User with the new email already exists");
    }
    newEmail = updateData.email;
  }

  const updatedUser = { ...existingUser, ...updateData };
  updatedUser.email = newEmail;

  const putParams = {
    TableName: TABLE_NAME,
    Item: updatedUser,
  };

  try {
    await db.send(new PutCommand(putParams));
    console.log(`User ${targetEmail} successfully updated.`);

    if (newEmail !== targetEmail) {
      const deleteParams = {
        TableName: TABLE_NAME,
        Key: { email: targetEmail },
      };
      await db.send(new DeleteCommand(deleteParams));
      console.log(`Old user record ${targetEmail} deleted.`);
    }
  } catch (err) {
    console.error("Error updating user:", err);
    throw new Error("Error updating user");
  }
};

module.exports = { userExists, createUser, editUser };
