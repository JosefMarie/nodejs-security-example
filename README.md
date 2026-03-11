# Node.js Security Example

This example demonstrates how to implement logging, auditing, and secure environment variable management in a Node.js application, based on the `SWDBD Notes` principles.

## Features

*   **Accountability & Tracing:** Uses `winston` for application logs and `morgan` for HTTP request logging.
*   **Secure Environment Variables:** Uses `dotenv` to load sensitive data. It also monitors for unauthorized modifications to immutable variables.
*   **Security Policies:** Uses `helmet` for HTTP headers and `express-rate-limit` to prevent Abuse.
*   **Role-Based Access Control (RBAC):** Restricts access to sensitive environment variables based on user roles (`getEnvVariableWithAudit()`).

## Prerequisites

You **do NOT** need to connect to a real database to run this example! The "database password" used in the code is just a simulated string stored in the `.env` file to demonstrate how to securely load, audit, and protect sensitive credentials.

To run this project, make sure you have installed:
1.  **Node.js**: The JavaScript runtime. You can download it from [nodejs.org](https://nodejs.org/).
2.  **Postman**: Used for sending API requests to test the server. Download it from [postman.com](https://www.postman.com/downloads/).

## Installation

1.  Open your terminal and navigate to the project directory:
    ```bash
    cd c:\Users\josep\Music\work\nodejs-security-example
    ```

2.  Install the required dependencies using npm:
    ```bash
    npm install
    ```
    > **Note:** The `package.json` file is already set up to install: `express`, `dotenv`, `winston`, `morgan`, `express-rate-limit`, and `helmet`.

## Running the Application

1.  Make sure your `.env` file is present in the root of the project folder (this was created for you).
2.  Start the application by running:
    ```bash
    node app.js
    ```
3.  You should see the message: `Server started successfully on port 3000` in the console.

## Testing the Application

Once the server is running, you can interact with it to see the security features in action.

### 1. Basic Route (Testing Morgan Logging)
Open your web browser and go to:
[http://localhost:3000/](http://localhost:3000/)
*   **What happens:** You will see a success message.
*   **Security feature:** Check the `logs/combined.log` file. You will see an entry recorded by Morgan that logs your connection details, proving **accountability**.

### 2. Secure Route - ADMIN (Testing RBAC and Auditing with Postman)
To test the secure admin route, use Postman to send a POST request with headers.

**In Postman:**
1.  Set the request type to **POST**.
2.  Enter the URL: `http://localhost:3000/admin/data`
3.  Go to the **Headers** tab.
4.  Add a new Key: `x-user-role` and Value: `admin`
5.  Click **Send**.

*   **What happens:** You will get a response: `{"message":"Access granted to admin route. Database secured."}`.
*   **Security feature:** Check the console or logs. `getEnvVariableWithAudit` logged that the `admin` role accessed the database password securely.

### 3. Secure Route - MANAGER (Testing multiple allowed roles)
We also have a route that allows *both* Managers and Admins to access the `SECRET_KEY`.

**In Postman:**
1.  Set the request type to **POST**.
2.  Enter the URL: `http://localhost:3000/manager/reports`
3.  Go to the **Headers** tab.
4.  Add a new Key: `x-user-role` and Value: `manager`
5.  Click **Send**.
*   **What happens:** You will get a response: `{"message":"Access granted to manager route. Reports generated."}`.
*   *(Note: You can also change the role to `admin` and it will still work!)*

### 4. Unauthorized Access Test
Now, try to access either of those POST requests but with a generic role.

**In Postman:**
1.  Keep the same setup for either the Admin or Manager URL.
2.  Change the Value of the `x-user-role` header from `admin`/`manager` to `guest` (or just uncheck/remove the header).
3.  Click **Send**.
*   **What happens:** The server rejects the request with a `403 Forbidden` status.
*   **Security feature:** The attempt is logged as an error, fulfilling the goal of **Detecting Malicious Behavior**.

## Exploring the Logs

All operational activities and security events are recorded in the `logs` folder.
*   `logs/combined.log`: General info, including Morgan's HTTP request logs.
*   `logs/error.log`: Specifically isolated errors (like unauthorized role access or missing environment variables) for easy auditing.
