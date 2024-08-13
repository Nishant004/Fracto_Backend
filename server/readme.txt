1. Real-time Registration:
    - Use http://Socket.IO for real-time communication between the server and clients.
- Clients should be able to register with the following fields:
        - Name
        - Email
        - Mobile
        - Avatar (URL or base64 encoded string)
    - Description
2. Session Management:
    - Use JSON Web Tokens (JWT) for managing sessions and authorization.
    - Implement a function to generate JWTs upon successful registration.
    - Ensure that the server can validate these tokens for session management.
3. Tracking Logged-in Sessions:
    - Maintain a list of currently logged-in users.
    - Include details of other logged-in sessions for a user when they log in.
    - Provide an endpoint or mechanism to retrieve session details.