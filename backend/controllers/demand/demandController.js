const { v4: uuidv4 } = require("uuid");
const db = require("../../services/db/db");
const {
  ScanCommand,
  PutCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");
const DEMANDS_TABLE = process.env.DB_TABLE_DEMANDS;

const createDemand = async (req, res) => {
  try {
    const author = req.user.username;
    const { title, demand, category } = req.body;

    if (!author || !title || !demand || !category) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const newDemand = {
      demandId: uuidv4(),
      author,
      title,
      demand,
      category,
      createdAt: new Date().toISOString(),
    };

    const params = {
      TableName: DEMANDS_TABLE,
      Item: newDemand,
    };

    await db.send(new PutCommand(params));

    res.status(201).json({
      message: "Demand created successfully!",
      data: newDemand,
    });
  } catch (error) {
    console.error("Error creating demand:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const fetchMyDemands = async (req, res) => {
  try {
    const author = req.user?.username;

    if (!author) {
      console.error("User not authenticated, req.user:", req.user);
      return res.status(400).json({ message: "User not authenticated" });
    }

    const params = {
      TableName: DEMANDS_TABLE,
      IndexName: "author-index", // GSI -- needs to be added in AWS
      KeyConditionExpression: "author = :author",
      ExpressionAttributeValues: {
        ":author": author,
      },
    };

    const { Items } = await db.send(new QueryCommand(params));

    if (!Items || Items.length === 0) {
      console.error(`No demands found for author: ${author}`);
      return res
        .status(404)
        .json({ message: "No demands found for this author." });
    }

    res.status(200).json({
      message: "Demands retrieved successfully!",
      data: Items,
    });
  } catch (error) {
    console.error("Error fetching demands:", error);
    console.error("Stack Trace:", error.stack);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const fetchAllDemands = async (req, res) => {
  try {
    const params = {
      TableName: DEMANDS_TABLE,
    };

    console.log("Scanning DynamoDB with params:", params);

    const { Items } = await db.send(new ScanCommand(params));

    console.log("Scan result:", Items);

    if (!Items || Items.length === 0) {
      console.error("No demands found.");
      return res
        .status(404)
        .json({ message: "No demands found in the table." });
    }

    const sortedItems = Items.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    res.status(200).json({
      message: "Demands retrieved successfully!",
      data: sortedItems,
    });
  } catch (error) {
    console.error("Error fetching demands:", error);
    console.error("Stack Trace:", error.stack);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { createDemand, fetchMyDemands, fetchAllDemands };
