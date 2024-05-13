require("dotenv").config();
const { IgApiClient } = require("instagram-private-api");
const fs = require("fs").promises;

// Initialize Instagram API client
const ig = new IgApiClient();

// Function to save data
const saveData = async (data) => {
  try {
    await fs.writeFile("./ig-state.json", JSON.stringify(data));
    // console.log("Login state saved.");
  } catch (error) {
    console.error("Error saving login state:", error);
  }
};

// Function to check if data exists
const checkDataExists = async () => {
  try {
    const fileExists = await fs
      .access("./ig-state.json")
      .then(() => true)
      .catch(() => false);
    return fileExists;
  } catch (error) {
    console.error("Error checking if data exists:", error);
    return false;
  }
};

// Function to load data
const loadData = async () => {
  try {
    const serializedState = await fs.readFile("./ig-state.json", "utf-8");
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Error loading login state:", error);
    return null;
  }
};

// Function to generate random delay
const getRandomDelay = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const MAX_RETRY_ATTEMPTS = 3; // Maximum number of retry attempts
const RETRY_DELAY_MS = 5000; // Delay between retry attempts (in milliseconds)
const MAX_USERS_PER_REQUEST = 50; // Maximum number of users per request

// Function to block user's followings with retry and random delay
const blockUserFollowingsWithRetry = async (
  username,
  minDelayMs = 1000,
  maxDelayMs = 5000
) => {
  try {
    let cursor = null;
    let hasNextPage = true;

    while (hasNextPage) {
      try {
        // Get user ID by username
        const userId = await ig.user.getIdByUsername(username);

        // Get user's following list
        const followingFeed = ig.feed.accountFollowing(userId);
        const followingItems = await followingFeed.items({
          limit: MAX_USERS_PER_REQUEST,
          cursor,
        });

        // Block each user in the following list with retry and random delay
        for (const user of followingItems) {
          let retryAttempts = 0;
          let success = false;
          while (!success && retryAttempts < MAX_RETRY_ATTEMPTS) {
            try {
              await ig.friendship.block(user.pk);
              console.log(`User ${user.username} blocked successfully.`);
              const delayMs = getRandomDelay(minDelayMs, maxDelayMs);
              console.log(
                `Waiting ${
                  delayMs / 1000
                } seconds before blocking the next user...`
              );
              await delay(delayMs);
              success = true; // Mark the operation as successful
            } catch (error) {
              console.error(`Error blocking user ${user.username}`);
              retryAttempts++; // Increment the retry attempts
              console.log(
                `Retrying blocking user ${user.username} (Attempt ${retryAttempts})...`
              );
              await delay(RETRY_DELAY_MS); // Wait before retrying
            }
          }
          if (!success) {
            console.error(
              `Failed to block user ${user.username} after ${MAX_RETRY_ATTEMPTS} attempts.`
            );
          }
        }

        cursor = followingFeed.cursor;
        hasNextPage = followingFeed.moreAvailable;
      } catch (error) {
        console.error("Error fetching following list:", error);
        await delay(RETRY_DELAY_MS); // Wait before retrying
      }
    }

    console.log(`All users followed by ${username} have been blocked.`);
  } catch (error) {
    console.error("Error blocking user's followings");
  }
};

// Delay function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  // Generate device
  ig.state.generateDevice(process.env.IG_USERNAME);

  // This function executes after every request
  ig.request.end$.subscribe(async () => {
    // Serialize state
    const serialized = await ig.state.serialize();

    // Delete version info from serialized state
    delete serialized.constants;

    // Save serialized state with a delay
    await saveData(serialized);
  });

  // Check if data exists
  if (await checkDataExists()) {
    // Load data
    const loadedData = await loadData();
    await ig.state.deserialize(loadedData);
    console.log("Logged in from saved state.");
  } else {
    // Login to Instagram account
    await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
    console.log("Logged in successfully.");
  }

  // Block user's followings with a random delay
  await blockUserFollowingsWithRetry("2024blockout_ar");

  // Most of the time you don't have to login after loading the state
})();
