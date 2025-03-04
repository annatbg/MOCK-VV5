const { v4: uuidv4 } = require("uuid");
const db = require("../../services/db/db");
const {
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  BatchGetCommand,
  GetCommand,
  DeleteCommand
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
const updateDemandMatches = async (req, res) => {
  try {
    const author = req.user?.username;
    const { demandId } = req.params;
    const { matchId, status } = req.body;

    console.log(`[updateDemandMatches] Updating match status: ${demandId}, ${matchId}, ${status}`);

    if (!author) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!demandId) {
      return res.status(400).json({ message: "Demand ID is required" });
    }

    if (!matchId) {
      return res.status(400).json({ message: "Match ID is required" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // Validate status
    const validStatuses = ['new', 'confirmedByMe', 'confirmedByThem', 'matched', 'rejectedByMe'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}` 
      });
    }

    // Get the current demand to verify ownership
    const getParams = {
      TableName: DEMANDS_TABLE,
      Key: { demandId },
    };

    const { Item: demand } = await db.send(new GetCommand(getParams));

    if (!demand) {
      return res.status(404).json({ message: "Demand not found" });
    }

    // Verify ownership
    if (demand.author !== author) {
      return res.status(403).json({ message: "Unauthorized to update this demand" });
    }

    // Find the match in the matches array
    let matches = demand.matches || [];
    let matchIndex = -1;
    let existingMatch = null;
    let previousStatus = null;

    // Find the match in the array (either as string or object)
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      if (
        match === matchId || 
        (typeof match === 'object' && match.id === matchId)
      ) {
        matchIndex = i;
        existingMatch = match;
        previousStatus = typeof match === 'object' ? match.status : 'new';
        break;
      }
    }

    if (matchIndex === -1) {
      return res.status(404).json({ message: "Match not found in demand" });
    }

    // Create the updated match object
    const updatedMatch = {
      id: matchId,
      status: status,
      updatedAt: new Date().toISOString()
    };

    // If the match was an object, preserve other properties
    if (typeof existingMatch === 'object' && existingMatch !== null) {
      for (const [key, value] of Object.entries(existingMatch)) {
        if (!['id', 'status', 'updatedAt'].includes(key)) {
          updatedMatch[key] = value;
        }
      }
    }

    // Create a new matches array with the updated match
    const updatedMatches = [...matches];
    updatedMatches[matchIndex] = updatedMatch;

    // Update the demand
    const updateParams = {
      TableName: DEMANDS_TABLE,
      Key: { demandId },
      UpdateExpression: "SET matches = :matches, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":matches": updatedMatches,
        ":updatedAt": new Date().toISOString()
      },
      ReturnValues: "ALL_NEW"
    };

    const { Attributes: updatedDemand } = await db.send(new UpdateCommand(updateParams));

    // Update the corresponding demand based on status change
    try {
      // Get the matching demand
      const matchDemandParams = {
        TableName: DEMANDS_TABLE,
        Key: { demandId: matchId }
      };

      const { Item: matchDemand } = await db.send(new GetCommand(matchDemandParams));
      
      if (!matchDemand) {
        console.warn(`Matching demand ${matchId} not found`);
      } else {
        console.log(`[updateDemandMatches] Found matching demand from ${matchDemand.author}`);
        
        // Find this demand in the matching demand's matches array
        const matchingMatches = matchDemand.matches || [];
        let matchingIndex = -1;
        let matchingExistingStatus = null;

        for (let i = 0; i < matchingMatches.length; i++) {
          const match = matchingMatches[i];
          if (
            match === demandId || 
            (typeof match === 'object' && match.id === demandId)
          ) {
            matchingIndex = i;
            matchingExistingStatus = typeof match === 'object' ? match.status : 'new';
            break;
          }
        }

        console.log(`[updateDemandMatches] Matching index: ${matchingIndex}, Status: ${matchingExistingStatus}`);

        // If found, update accordingly
        if (matchingIndex !== -1) {
          let updatedMatchingMatches = [...matchingMatches];
          
          // Handle different status changes
          if (status === 'rejectedByMe') {
            console.log(`[updateDemandMatches] Removing match from other user's view`);
            // Remove this demand from the other demand's matches (hide from them)
            updatedMatchingMatches.splice(matchingIndex, 1);
          } else if (previousStatus === 'rejectedByMe' && status === 'new') {
            console.log(`[updateDemandMatches] Restoring match to other user's view`);
            // Add this demand back to the other demand's matches
            updatedMatchingMatches[matchingIndex] = {
              id: demandId,
              status: 'new',
              updatedAt: new Date().toISOString()
            };
          } else if (status === 'confirmedByMe') {
            console.log(`[updateDemandMatches] Setting match as confirmedByMe, checking other side`);
            
            // Check if the other side has already confirmed
            if (matchingExistingStatus === 'confirmedByMe') {
              console.log(`[updateDemandMatches] Both sides confirmed! Setting to matched`);
              // Both sides have confirmed - set to matched on both sides
              
              // First update the matching demand
              updatedMatchingMatches[matchingIndex] = {
                id: demandId,
                status: 'matched',
                updatedAt: new Date().toISOString()
              };
              
              // Then update our demand again to ensure consistency
              // This is a separate operation to ensure both sides show as matched
              const finalUpdateParams = {
                TableName: DEMANDS_TABLE,
                Key: { demandId },
                UpdateExpression: "SET matches[" + matchIndex + "].status = :status, matches[" + matchIndex + "].updatedAt = :updatedAt",
                ExpressionAttributeValues: {
                  ":status": "matched",
                  ":updatedAt": new Date().toISOString()
                }
              };
              
              try {
                await db.send(new UpdateCommand(finalUpdateParams));
                console.log(`[updateDemandMatches] Successfully updated our side to matched`);
                
                // Update the response data to reflect the matched status
                if (updatedDemand && updatedDemand.matches && updatedDemand.matches[matchIndex]) {
                  updatedDemand.matches[matchIndex].status = 'matched';
                  updatedDemand.matches[matchIndex].updatedAt = new Date().toISOString();
                }
              } catch (updateError) {
                console.error(`[updateDemandMatches] Error updating our side to matched:`, updateError);
              }
            } else {
              console.log(`[updateDemandMatches] Setting other side to confirmedByThem`);
              // Set to confirmedByThem on the other demand
              updatedMatchingMatches[matchingIndex] = {
                id: demandId,
                status: 'confirmedByThem',
                updatedAt: new Date().toISOString()
              };
            }
          }
          
          // Update the matching demand
          const updateMatchDemandParams = {
            TableName: DEMANDS_TABLE,
            Key: { demandId: matchId },
            UpdateExpression: "SET matches = :matches, updatedAt = :updatedAt",
            ExpressionAttributeValues: {
              ":matches": updatedMatchingMatches,
              ":updatedAt": new Date().toISOString()
            }
          };
          
          try {
            await db.send(new UpdateCommand(updateMatchDemandParams));
            console.log(`[updateDemandMatches] Successfully updated matching demand`);
          } catch (updateError) {
            console.error(`[updateDemandMatches] Error updating matching demand:`, updateError);
            throw updateError;  // Re-throw to be caught by outer catch
          }
        } else {
          // Case: Undoing rejection but match not found in other demand
          if (previousStatus === 'rejectedByMe' && status === 'new') {
            console.log(`[updateDemandMatches] Restoring match that was completely removed`);
            // Re-add the match to the other demand's matches
            const updatedMatchingMatches = [...matchingMatches, {
              id: demandId,
              status: 'new',
              updatedAt: new Date().toISOString()
            }];
            
            // Update the matching demand to add back our demand
            const updateMatchDemandParams = {
              TableName: DEMANDS_TABLE,
              Key: { demandId: matchId },
              UpdateExpression: "SET matches = :matches, updatedAt = :updatedAt",
              ExpressionAttributeValues: {
                ":matches": updatedMatchingMatches,
                ":updatedAt": new Date().toISOString()
              }
            };
            
            try {
              await db.send(new UpdateCommand(updateMatchDemandParams));
              console.log(`[updateDemandMatches] Successfully restored match to other demand`);
            } catch (updateError) {
              console.error(`[updateDemandMatches] Error restoring match:`, updateError);
            }
          } else {
            console.log(`[updateDemandMatches] Match not found in other demand's matches array`);
          }
        }
      }
    } catch (err) {
      console.error("[updateDemandMatches] Error updating matching demand:", err);
      // We still want to continue and return success for the initial update
    }

    res.status(200).json({
      message: "Match status updated successfully!",
      data: updatedDemand
    });
  } catch (error) {
    console.error("[updateDemandMatches] Error updating match status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { 
  createDemand, 
  fetchMyDemands, 
  fetchAllDemands, 
  fetchDemandsByIds, 
  deleteDemand,
  updateDemandMatches
};