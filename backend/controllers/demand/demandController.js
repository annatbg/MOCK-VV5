const { v4: uuidv4 } = require("uuid");
const db = require("../../services/db/db");
const {
  PutCommand,
  QueryCommand,
  ScanCommand,
  GetCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const DEMANDS_TABLE = process.env.DB_TABLE_DEMANDS;

// Definiera tillåtna kategorier
const allowedCategories = [
  "Technology",
  "Health",
  "Education",
  "Finance",
  "Environment",
];

const createDemand = async (req, res) => {
  try {
    const author = req.user?.username;
    const { demandId } = req.params;

    if (!author) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    if (!demandId) {
      return res.status(400).json({ message: "Demand ID is required" });
    }

    // Hämta demand för att verifiera att den tillhör användaren
    const getParams = {
      TableName: DEMANDS_TABLE,
      Key: { demandId },
    };

    const { Item } = await db.send(new GetCommand(getParams));

    if (!Item) {
      return res.status(404).json({ message: "Demand not found" });
    }

    if (Item.author !== author) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this demand" });
    }
    // Radera demanden
    const deleteParams = {
      TableName: DEMANDS_TABLE,
      Key: { demandId },
    };

    await db.send(new DeleteCommand(deleteParams));

    res.status(200).json({ message: "Demand deleted successfully!" });
  } catch (error) {
    console.error("Error deleting demand:", error);
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

const deleteDemand = async (req, res) => {
  try {
    const author = req.user?.username;
    const { demandId } = req.params; // Hämta demandId från URL-parametrar

    console.log("Incoming demandId:", demandId);

    if (!author) {
      console.error("User not authenticated, req.user:", req.user);
      return res.status(400).json({ message: "User not authenticated" });
    }

    if (!demandId) {
      return res.status(400).json({ message: "Demand ID is required" });
    }

    // Hämta demand för att verifiera att den tillhör användaren
    const getParams = {
      TableName: DEMANDS_TABLE,
      Key: { demandId },
    };

    const { Item } = await db.send(new GetCommand(getParams));
    console.log("Fetched Item:", Item);

    if (!Item) {
      return res.status(404).json({ message: "Demand not found" });
    }

    if (Item.author !== author) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this demand" });
    }

    // Radera demanden
    const deleteParams = {
      TableName: DEMANDS_TABLE,
      Key: { demandId },
    };

    console.log("Deleting Item:", Item);

    await db.send(new DeleteCommand(deleteParams));

    res.status(200).json({ message: "Demand deleted successfully!", demandId });
  } catch (error) {
    console.error("Error deleting demand:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createDemand,
  fetchMyDemands,
  fetchAllDemands,
  deleteDemand,
};
