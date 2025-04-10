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

const DEMANDS_TABLE = process.env.DB_TABLE_DEMANDS;

const allowedCategories = [
  "Technology",
  "Health",
  "Education",
  "Finance",
  "Environment",
];

const createDemand = async (event) => {
  try {
    const author = event.requestContext?.authorizer?.username;
    const { title, demand, category } = JSON.parse(event.body);

    if (!author) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized" }),
      };
    }

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

    let matchingDemands = [];
    try {
      const queryParams = {
        TableName: DEMANDS_TABLE,
        IndexName: "category-index",
        KeyConditionExpression: "category = :category",
        ExpressionAttributeValues: { ":category": category },
      };
      const { Items } = await db.send(new QueryCommand(queryParams));
      matchingDemands = (Items || []).filter((item) => item.author !== author);
    } catch (queryError) {
      console.error("Error querying matching demands:", queryError);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Error querying matching demands" }),
      };
    }

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

    try {
      await db.send(
        new PutCommand({ TableName: DEMANDS_TABLE, Item: newDemand })
      );
    } catch (putError) {
      console.error("Error saving new demand:", putError);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Error saving new demand" }),
      };
    }

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
  try {
    const author = event.requestContext?.authorizer?.username;

    if (!author) {
      console.error(
        "User not authenticated, event.requestContext.authorizer:",
        event.requestContext?.authorizer
      );
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "User not authenticated" }),
      };
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
    console.error("Stack Trace:", error.stack);
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
      console.error("No demands found in the database.");
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
    console.error("Stack Trace:", error.stack);
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
  try {
    const author = event.requestContext?.authorizer?.username;
    const demandId = event.pathParameters?.demandId;

    console.log("Incoming demandId:", demandId);

    if (!author) {
      console.error(
        "User not authenticated, authorizer:",
        event.requestContext?.authorizer
      );
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "User not authenticated" }),
      };
    }

    if (!demandId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Demand ID is required" }),
      };
    }

    const getParams = {
      TableName: DEMANDS_TABLE,
      Key: { demandId },
    };

    const { Item } = await db.send(new GetCommand(getParams));
    console.log("Fetched Item:", Item);

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

    console.log("Deleting Item:", Item);

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

module.exports = {
  createDemand,
  fetchMyDemands,
  fetchAllDemands,
  fetchDemandsByIds,
  deleteDemand,
};
