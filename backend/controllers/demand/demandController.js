const { v4: uuidv4 } = require("uuid");
const db = require("../../services/db/db");
const {
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  BatchGetCommand,
  GetCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { getUserFromToken } = require("../../services/utils/jwt");

const DEMANDS_TABLE = process.env.DB_TABLE_DEMANDS;

const allowedCategories = [
  "Technology",
  "Health",
  "Education",
  "Finance",
  "Environment",
];

const createDemand = async (event) => {
  const user = getUserFromToken(event);
  const author = user?.username;

  if (!author) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized" }),
    };
  }

  const { title, demand, category } = JSON.parse(event.body);

  if (!title || !demand || !category) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "All fields are required!" }),
    };
  }

  if (!allowedCategories.includes(category)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Invalid category! Allowed categories: ${allowedCategories.join(
          ", "
        )}`,
      }),
    };
  }

  try {
    const queryParams = {
      TableName: DEMANDS_TABLE,
      IndexName: "category-index",
      KeyConditionExpression: "category = :category",
      ExpressionAttributeValues: { ":category": category },
    };
    const { Items } = await db.send(new QueryCommand(queryParams));
    const matchingDemands = (Items || []).filter(
      (item) => item.author !== author
    );

    const matchingDemandIds = matchingDemands.map((item) => item.demandId);
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

    await db.send(
      new PutCommand({ TableName: DEMANDS_TABLE, Item: newDemand })
    );

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
      } catch (err) {
        console.error(`Error updating demand ${match.demandId}:`, err);
      }
    });
    await Promise.all(updatePromises);

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Demand created successfully and matches updated!",
        data: newDemand,
      }),
    };
  } catch (error) {
    console.error("Unexpected error in createDemand:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

const fetchMyDemands = async (event) => {
  const user = getUserFromToken(event);
  const author = user?.username;

  if (!author) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized" }),
    };
  }

  try {
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
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "No demands found for this author." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Demands retrieved successfully!",
        data: Items,
      }),
    };
  } catch (error) {
    console.error("Error fetching demands:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

const fetchAllDemands = async () => {
  try {
    const params = {
      TableName: DEMANDS_TABLE,
    };

    const { Items } = await db.send(new ScanCommand(params));

    if (!Items || Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "No demands found." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Demands retrieved successfully!",
        data: Items,
      }),
    };
  } catch (error) {
    console.error("Error fetching all demands:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

const fetchDemandsByIds = async (event) => {
  try {
    let ids = [];

    const query = event.queryStringParameters;
    const body = event.body ? JSON.parse(event.body) : {};

    if (query?.id) {
      ids = [query.id];
    } else if (query?.ids) {
      ids = query.ids.split(",");
    } else if (body.ids) {
      ids = Array.isArray(body.ids) ? body.ids : [body.ids];
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "No demand id(s) provided." }),
      };
    }

    if (ids.length === 1) {
      const params = {
        TableName: DEMANDS_TABLE,
        Key: { demandId: ids[0] },
      };
      const { Item } = await db.send(new GetCommand(params));
      if (!Item) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Demand not found." }),
        };
      }
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Demand retrieved successfully!",
          data: Item,
        }),
      };
    } else {
      const params = {
        RequestItems: {
          [DEMANDS_TABLE]: {
            Keys: ids.map((id) => ({ demandId: id })),
          },
        },
      };
      const { Responses } = await db.send(new BatchGetCommand(params));
      const demands = Responses?.[DEMANDS_TABLE] ?? [];
      if (demands.length === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "No demands found for provided ids.",
          }),
        };
      }
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Demands retrieved successfully!",
          data: demands,
        }),
      };
    }
  } catch (error) {
    console.error("Error fetching demand(s):", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

const deleteDemand = async (event) => {
  const user = getUserFromToken(event);
  const author = user?.username;
  const demandId = event.pathParameters?.demandId;

  if (!author) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized" }),
    };
  }

  if (!demandId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Demand ID is required" }),
    };
  }

  try {
    const getParams = {
      TableName: DEMANDS_TABLE,
      Key: { demandId },
    };

    const { Item } = await db.send(new GetCommand(getParams));

    if (!Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Demand not found" }),
      };
    }

    if (Item.author !== author) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Unauthorized to delete this demand" }),
      };
    }

    const deleteParams = {
      TableName: DEMANDS_TABLE,
      Key: { demandId },
    };

    await db.send(new DeleteCommand(deleteParams));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Demand deleted successfully!",
        demandId,
      }),
    };
  } catch (error) {
    console.error("Error deleting demand:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

const updateDemandMatches = async (event) => {
  const user = getUserFromToken(event);
  const author = user?.username;

  if (!author) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized" }),
    };
  }

  const demandId = event.pathParameters?.demandId;
  const { matchId, status } = JSON.parse(event.body || "{}");

  if (!demandId || !matchId || !status) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Demand ID, match ID, and status are required",
      }),
    };
  }


  const validStatuses = ["new", "confirmedByMe", "confirmedByThem", "rejectedByMe"];
  
  if (!validStatuses.includes(status)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`,
      }),
    };
  }

  try {

    const [myDemandRes, matchDemandRes] = await Promise.all([
      db.send(new GetCommand({ TableName: DEMANDS_TABLE, Key: { demandId } })),
      db.send(new GetCommand({ TableName: DEMANDS_TABLE, Key: { demandId: matchId } }))
    ]);

    const myDemand = myDemandRes.Item;
    const theirDemand = matchDemandRes.Item;

    if (!myDemand || !theirDemand) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "One or both demands not found" }),
      };
    }

    if (myDemand.author !== author) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Unauthorized to update this demand" }),
      };
    }

    // Helper: update or insert match in matches array
    const updateMatchList = (matches = [], matchId, status) => {
      const now = new Date().toISOString();
      const index = matches.findIndex(m => m === matchId || (typeof m === "object" && m.id === matchId));

      const updatedMatch = {
        id: matchId,
        status,
        updatedAt: now
      };

      if (index !== -1) {
        matches[index] = updatedMatch;
      } else {
        matches.push(updatedMatch);
      }

      return matches;
    };

 
    const existingMatchFromThem = theirDemand.matches?.find(m => {
      return typeof m === "object" && m.id === demandId;
    });

 
    const theyHaveConfirmed = existingMatchFromThem?.status === "confirmedByMe";
    
   
    let myFinalStatus, theirFinalStatus;


    if (status === "confirmedByMe" && theyHaveConfirmed) {
      // Both users have confirmed - set both to matched
      myFinalStatus = "matched";
      theirFinalStatus = "matched";
    } else if (status === "confirmedByMe") {
      // Only the current user is confirming
      myFinalStatus = "confirmedByMe";
      theirFinalStatus = "confirmedByThem";
    } else if (status === "rejectedByMe") {
      // Handling rejection
      myFinalStatus = "rejectedByMe";
      theirFinalStatus = "rejectedByThem";
    } else if (status === "new") {
      // If the status is "new", we just update the match status as "new"
      myFinalStatus = "new";
      theirFinalStatus = "new";
    }

    // Update both match records
    const myMatches = updateMatchList(myDemand.matches, matchId, myFinalStatus);
    const theirMatches = updateMatchList(theirDemand.matches, demandId, theirFinalStatus);

    // Perform both updates
    const now = new Date().toISOString();
    const [updatedMine, updatedTheirs] = await Promise.all([
      db.send(new UpdateCommand({
        TableName: DEMANDS_TABLE,
        Key: { demandId },
        UpdateExpression: "SET matches = :matches, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":matches": myMatches,
          ":updatedAt": now
        },
        ReturnValues: "ALL_NEW"
      })),
      db.send(new UpdateCommand({
        TableName: DEMANDS_TABLE,
        Key: { demandId: matchId },
        UpdateExpression: "SET matches = :matches, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":matches": theirMatches,
          ":updatedAt": now
        },
        ReturnValues: "ALL_NEW"
      }))
    ]);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Match status updated successfully!",
        data: {
          myDemand: updatedMine.Attributes,
          matchedDemand: updatedTheirs.Attributes,
          matched: myFinalStatus === "matched"
        }
      }),
    };
  } catch (error) {
    console.error("[updateDemandMatches] Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};


const getAcceptedDemands = async (event) => {
  const user   = getUserFromToken(event);
  const author = user?.username;

  if (!author) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized" }),
    };
  }

  try {
  
    const queryParams = {
      TableName: DEMANDS_TABLE,
      IndexName: "author-index",
      KeyConditionExpression: "author = :author",
      ExpressionAttributeValues: { ":author": author },
    };
    const { Items: myDemands } = await db.send(new QueryCommand(queryParams));

    if (!myDemands || myDemands.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "You have no demands." }),
      };
    }


    const acceptedDemands = myDemands.filter((d) =>
      Array.isArray(d.matches) &&
      d.matches.some(
        (m) => m.status === "confirmedByMe" || m.status === "confirmedByThem"
      )
    );

    if (acceptedDemands.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "No accepted demands found." }),
      };
    }


    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Accepted demands retrieved successfully",
        data: acceptedDemands,
      }),
    };
  } catch (error) {
    console.error("[getAcceptedDemands] Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};




module.exports = {
  createDemand,
  fetchMyDemands,
  fetchAllDemands,
  fetchDemandsByIds,
  deleteDemand,
  updateDemandMatches,
  getAcceptedDemands
};
