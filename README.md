# Instagram Bot - Auto Block Users - 2024 Block Out

## Description:

This Instagram bot script allows you to automatically block all users followed by a specified account.

## Installation:

1. Clone the repository or download the script files to your local machine.
2. Ensure you have Node.js installed on your system.
3. Install the required dependencies by running `npm install` in the terminal within the project directory.
4. Create a `.env` file in the project directory and add your Instagram username and password in the following format:

`IG_USERNAME=your_username \n
IG_PASSWORD=your_password`

**Note:** Make sure to keep your credentials secure and do not share them publicly.

5. Save the changes to the `.env` file.

## Usage:

1. Run the script using the command `node index.js` in the terminal within the project directory.
2. The script will log in to the specified Instagram account and start blocking users followed by the account.
3. The operation of blocking users is retried with a random delay if any error occurs.
4. Once all users have been blocked, the script will save the login state data for future use.

## What to Do if Blocked:

If you encounter any errors or get blocked by Instagram during the execution of the script, follow these steps:

1. **Stop the Script:** Immediately stop the execution of the script.
2. **Retry:** Wait for some time and then rerun the script. If you encounter errors repeatedly, consider increasing the delay between blocking attempts or reducing the number of users processed per request.
3. **Review Code:** Double-check your code for any mistakes or misconfigurations that might lead to being blocked by Instagram.
4. **Contact Support:** If the issue persists, you can reach out to Instagram support for further assistance.

By following these steps and precautions, you can effectively use the Instagram bot script without encountering issues.
