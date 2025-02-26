const { v4: uuidv4 } = require("uuid");
const db = require("../../services/db/db");
const {
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand
} = require("@aws-sdk/lib-dynamodb");
const DEMANDS_TABLE = process.env.DB_TABLE_DEMANDS;

// Tillåtna kategorier
const allowedCategories = [
  "Technology",
  "Health",
  "Education",
  "Finance",
  "Environment",
];

const createDemand = async (req, res) => {
  try {
    const author = req.user.username;
    const { title, demand, category } = req.body;

    if (!author || !title || !demand || !category) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Validate allowed category
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        message: `Invalid category! Allowed categories: ${allowedCategories.join(", ")}`,
      });
    }

    // Query existing demands in the same category 'matches'
    const queryParams = {
      TableName: DEMANDS_TABLE,
      IndexName: "category-index",
      KeyConditionExpression: "category = :category",
      ExpressionAttributeValues: { ":category": category },
    };

    const { Items: matchingDemands } = await db.send(new QueryCommand(queryParams));
    const matchingDemandIds = matchingDemands ? matchingDemands.map(item => item.demandId) : [];

    // Create new demand item
    const newDemandId = uuidv4();
    const newDemand = {
      demandId: newDemandId,
      author,
      title,
      demand,
      category,
      createdAt: new Date().toISOString(),
      matches: matchingDemandIds,
    };

    // Save the new demand
    await db.send(new PutCommand({
      TableName: DEMANDS_TABLE,
      Item: newDemand,
    }));

    // Update existing demands to add the new demandId to their matches
    for (const match of matchingDemands) {
      const updateParams = {
        TableName: DEMANDS_TABLE,
        Key: { demandId: match.demandId },
        UpdateExpression: "SET matches = list_append(if_not_exists(matches, :emptyList), :newMatch)",
        ExpressionAttributeValues: {
          ":newMatch": [newDemandId],
          ":emptyList": [],
        },
      };
      await db.send(new UpdateCommand(updateParams));
    }

    res.status(201).json({
      message: "Demand created successfully and matches updated!",
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
      IndexName: "author-index",
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

    const { Items } = await db.send(new ScanCommand(params));

    if (!Items || Items.length === 0) {
      console.error("No demands found in the database.");
      return res.status(404).json({ message: "No demands found." });
    }

    res.status(200).json({
      message: "Demands retrieved successfully!",
      data: Items,
    });
  } catch (error) {
    console.error("Error fetching all demands:", error);
    console.error("Stack Trace:", error.stack);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = { createDemand, fetchMyDemands, fetchAllDemands };