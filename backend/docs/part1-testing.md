# Part 1 — Testing Documentation

## Overview

This part of Part 1 covers testing of the API endpoints built (registration, login, and the protected profile route) using Postman. Testing was run against the local backend at https://localhost:5000 to check that it works properly when given correct info, and that it actually rejects bad input, wrong credentials, and missing/invalid tokens instead of just letting anything through.

11 test cases were run in total and all gave the expected results.

## Test Cases

### Registration — POST /api/auth/register

| Test | Input | Expected | Result |
|---|---|---|---|
| Successful registration | Valid email + valid password | 201 Created, returns user + JWT | Pass |
| Missing information | Email only, no password | 400 Bad Request | Pass |
| Invalid information | Invalid email format + weak password | 400 Bad Request | Pass |
| Duplicate user | Same email as an already-registered user | 409 Conflict | Pass |

![Register success](../backend/screenshots/register-success-201.png)

![Register missing info](../backend/screenshots/register-missing-info-400.png)

![Register invalid info](../backend/screenshots/register-invalid-info-400.png)

![Register duplicate user](../backend/screenshots/register-duplicate-409.png)

### Login — POST /api/auth/login

| Test | Input | Expected | Result |
|---|---|---|---|
| Successful login | Valid registered email + correct password | 200 OK, returns user + JWT | Pass |
| Incorrect password | Valid registered email + wrong password | 401 Unauthorized | Pass |
| Unknown user | Email not registered in the system | 401 Unauthorized | Pass |
| Missing information | Email only, no password | 400 Bad Request | Pass |

![Login success](../backend/screenshots/login-success-200.png)

![Login incorrect password](../backend/screenshots/login-incorrect-password-401.png)

![Login unknown user](../backend/screenshots/login-unknown-user-401.png)

![Login missing info](../backend/screenshots/login-missing-info-400.png)

### Authentication — GET /api/auth/profile

| Test | Input | Expected | Result |
|---|---|---|---|
| Valid JWT | Valid Authorization: Bearer <token> header | 200 OK, returns user profile | Pass |
| Missing JWT | No Authorization header | 401 Unauthorized | Pass |
| Invalid JWT | Malformed/garbage token in header | 401 Unauthorized | Pass |

![Auth valid JWT](../backend/screenshots/auth-valid-jwt-200.png)

![Auth missing JWT](../backend/screenshots/auth-missing-jwt-401.png)

![Auth invalid JWT](../backend/screenshots/auth-invalid-jwt-401.png)

## Security-Specific Notes

A couple of these tests were specifically about checking security behaviour, not just whether the endpoint works:

- The login errors are deliberately vague on purpose. Whether the email is wrong or the password is wrong, the response is the exact same 401 and the same message ("Invalid email or password"). This is actually a good thing security-wise. It stops someone from being able to figure out which emails are registered on the system just by spamming the login endpoint and seeing which error comes back.
- Trying to register with an email that's already in use correctly gets blocked with a 409, so the system isn't letting duplicate accounts get created.
- The JWT checks on the profile route all worked as expected. A valid token gets a 200, and both no token and a garbage/invalid token get rejected with 401. This shows the route is actually checking that the token is real and not just checking that some header exists.
- Sending bad registration info (invalid email, weak password) gets rejected with 400 before it even gets near the user store, which means the validation is catching bad data early instead of relying on something further down the line to catch it.

## Testing Method

All endpoints were tested using Postman, with the full set of requests saved as an exportable collection (postman/HustleHub-Part1.postman_collection.json). SSL certificate verification had to be turned off in Postman's settings first, since the backend is running on a self-signed HTTPS certificate locally. For every request, a screenshot was taken showing the endpoint, the request body, the response body, and the status code, since that's what actually counts as evidence for this part of the submission.