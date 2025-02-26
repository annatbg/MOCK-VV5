const { v4: uuidv4 } = require("uuid");
const db = require("../../services/db/db");
const {
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  BatchGetCommand
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
    // Check authentication
    if (!req.user || !req.user.username) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const author = req.user.username;
    const { title, demand, category } = req.body;

    if (!title || !demand || !category) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        message: `Invalid category! Allowed categories: ${allowedCategories.join(", ")}`,
      });
    }

    // Query existing demands in the same category using the GSI "category-index"
    let matchingDemands = [];
    try {
      const queryParams = {
        TableName: DEMANDS_TABLE,
        IndexName: "category-index",
        KeyConditionExpression: "category = :category",
        ExpressionAttributeValues: { ":category": category },
      };
      const { Items } = await db.send(new QueryCommand(queryParams));
      // Exclude demands from the same author
      matchingDemands = (Items || []).filter(item => item.author !== author);
    } catch (queryError) {
      console.error("Error querying matching demands:", queryError);
      return res.status(500).json({ message: "Error querying matching demands" });
    }

    // Build matches only from different authors
    const matchingDemandIds = matchingDemands.map(item => item.demandId);
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
    try {
      await db.send(new PutCommand({ TableName: DEMANDS_TABLE, Item: newDemand }));
    } catch (putError) {
      console.error("Error saving new demand:", putError);
      return res.status(500).json({ message: "Error saving new demand" });
    }

    // Update existing demands to include the new demandId in their matches
    const updatePromises = matchingDemands.map(async (match) => {
      try {
        const updateParams = {
          TableName: DEMANDS_TABLE,
          Key: { demandId: match.demandId },
          UpdateExpression:
            "SET matches = list_append(if_not_exists(matches, :emptyList), :newMatch)",
          ExpressionAttributeValues: {
            ":newMatch": [newDemandId],
            ":emptyList": [],
          },
        };
        await db.send(new UpdateCommand(updateParams));
      } catch (updateError) {
        console.error(`Error updating demand ${match.demandId}:`, updateError);
        // Optionally handle error (e.g., log for further investigation)
      }
    });
    await Promise.all(updatePromises);

    res.status(201).json({
      message: "Demand created successfully and matches updated!",
      data: newDemand,
    });
  } catch (error) {
    console.error("Unexpected error in createDemand:", error);
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

const fetchDemandsByIds = async (req, res) => {
  try {
    let ids = [];

    // Get ids from query params or body
    if (req.query.id) {
      ids = [req.query.id];
    } else if (req.query.ids) {
      ids = req.query.ids.split(",");
    } else if (req.body.ids) {
      ids = Array.isArray(req.body.ids) ? req.body.ids : [req.body.ids];
    } else {
      return res.status(400).json({ message: "No demand id(s) provided." });
    }

    // If a single id is provided, use GetCommand
    if (ids.length === 1) {
      const params = {
        TableName: DEMANDS_TABLE,
        Key: { demandId: ids[0] },
      };
      const { Item } = await db.send(new GetCommand(params));
      if (!Item) {
        return res.status(404).json({ message: "Demand not found." });
      }
      return res.status(200).json({
        message: "Demand retrieved successfully!",
        data: Item,
      });
    } else {
      // For multiple ids, use BatchGetCommand
      const params = {
        RequestItems: {
          [DEMANDS_TABLE]: {
            Keys: ids.map((id) => ({ demandId: id })),
          },
        },
      };
      const { Responses } = await db.send(new BatchGetCommand(params));
      const demands =
        Responses && Responses[DEMANDS_TABLE] ? Responses[DEMANDS_TABLE] : [];
      if (demands.length === 0) {
        return res
          .status(404)
          .json({ message: "No demands found for provided ids." });
      }
      return res.status(200).json({
        message: "Demands retrieved successfully!",
        data: demands,
      });
    }
  } catch (error) {
    console.error("Error fetching demand(s):", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { createDemand, fetchMyDemands, fetchAllDemands, fetchDemandsByIds };