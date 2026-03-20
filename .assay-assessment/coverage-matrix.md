# Coverage Matrix -- saas-starter

| Domain                                         | Route                                                                                 | Pass | Partial | Fail | Total | Score |
| ---------------------------------------------- | ------------------------------------------------------------------------------------- | ---- | ------- | ---- | ----- | ----- |
| **Auth Code Callback (PKCE Session Exchange)** |                                                                                       |      |         |      |       |       |
|                                                | GET /auth/callback?code=<code>                                                        | 7    | 0       | 0    | 7     | 100%  |
| **Authenticated Dashboard Access**             |                                                                                       |      |         |      |       |       |
|                                                | GET /dashboard                                                                        | 7    | 1       | 0    | 8     | 88%   |
| **Email Verification Prompt**                  |                                                                                       |      |         |      |       |       |
|                                                | Redirect from POST /auth/signup on success                                            | 3    | 0       | 0    | 3     | 100%  |
| **Forgot Password**                            |                                                                                       |      |         |      |       |       |
|                                                | POST /auth/forgot-password                                                            | 9    | 0       | 0    | 9     | 100%  |
| **Public Home Page Visit**                     |                                                                                       |      |         |      |       |       |
|                                                | GET /                                                                                 | 4    | 0       | 0    | 4     | 100%  |
| **Reset Password**                             |                                                                                       |      |         |      |       |       |
|                                                | POST /auth/reset-password (after arriving via email link to GET /auth/reset-password) | 12   | 0       | 0    | 12    | 100%  |
| **User Login**                                 |                                                                                       |      |         |      |       |       |
|                                                | POST /auth/login                                                                      | 9    | 0       | 0    | 9     | 100%  |
| **User Logout**                                |                                                                                       |      |         |      |       |       |
|                                                | POST /dashboard (form submission from Sign out button)                                | 6    | 0       | 0    | 6     | 100%  |
| **User Signup**                                |                                                                                       |      |         |      |       |       |
|                                                | POST /auth/signup                                                                     | 11   | 0       | 0    | 11    | 100%  |
