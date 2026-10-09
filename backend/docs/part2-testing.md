# Part 2 — Testing Documentation

## Overview

This part covers testing of the new backend endpoints (gig management, bookings, transactions and income tracking) along with the role-based access control, ownership checks, validation and rate limiting that sit on top of them. Testing was run against the local backend at https://localhost:5000, connected to the MongoDB Atlas database, using a Postman collection that was also run from the terminal with Newman. The collection has 55 requests. Newman ran 82 requests in total, because the rate limiting test sends a burst of extra booking requests, and checked 115 assertions. 113 passed and 2 failed. Both failures are the same bug (malformed gig ids returning a 500), which is covered under Issues Found below. Everything else gave the expected result. Three test accounts were registered at the start of each run (one client and two freelancers, called freelancer A and freelancer B), so that the wrong-owner and wrong-role cases could be tested properly.

## Test Cases

### Setup — POST /api/auth/register

| Test | Input | Expected | Result |
|---|---|---|---|
| Register client | Valid email + valid password + role "client" | 201 Created, returns user + JWT | Pass |
| Register freelancer A | Valid email + valid password + role "freelancer" | 201 Created, returns user + JWT | Pass |
| Register freelancer B | Valid email + valid password + role "freelancer" | 201 Created, returns user + JWT | Pass |

![Register client](../screenshots/Register-Client.png)

![Register freelancer A](../screenshots/Register-Freelancer-A.png)

![Register freelancer B](../screenshots/Register-Freelancer-B.png)

### Authentication — POST /api/auth/register and /api/auth/login

| Test | Input | Expected | Result |
|---|---|---|---|
| Duplicate email | Email that is already registered | 409 Conflict | Pass |
| Weak password | Password of "weak" | 400 Bad Request | Pass |
| Admin role at registration | role set to "admin" | 400 Bad Request | Pass |
| Wrong password | Registered email + wrong password | 401 Unauthorized | Pass |
| Successful login | Registered email + correct password | 200 OK, returns user + JWT | Pass |
| Profile with valid token | Valid Bearer token | 200 OK | Pass |

![Register duplicate user](../screenshots/Register-Duplicate-User.png)

![Register weak password](../screenshots/Register-Weak-Password.png)

![Register invalid role admin](../screenshots/Register-Invalid-Role-Admin.png)

![Login incorrect password](../screenshots/Login-Incorrect-Password.png)

![Login success](../screenshots/Login-Success.png)

![Auth valid JWT](../screenshots/Auth-Valid-JWT.png)

### Gig management — owning freelancer — /api/gigs

| Test | Input | Expected | Result |
|---|---|---|---|
| Create gig | Freelancer A, valid title, description and price | 201 Created | Pass |
| Create second gig (to delete) | Freelancer A, valid title, description and price | 201 Created | Pass |
| List own gigs | Freelancer A, GET /gigs/mine | 200 OK, includes the new gig | Pass |
| Update gig | Freelancer A changes title and price to 150 | 200 OK, price updated | Pass |
| Delete gig | Freelancer A deletes their second gig | 200 OK | Pass |
| Delete the same gig again | Freelancer A, gig already deleted | 404 Not Found | Pass |
| Public gig list | No token, GET /gigs | 200 OK | Pass |
| Public gig by id | No token, GET /gigs/:id | 200 OK | Pass |

![A creates gig success](../screenshots/A-Creates-Gig-Success.png)

![A creates second gig to delete](../screenshots/A-Creates-Second-Gig-To-Delete.png)

![A lists own gigs](../screenshots/A-Lists-Own-Gigs.png)

![A updates gig](../screenshots/A-Updates-Gig.png)

![A deletes second gig](../screenshots/A-Deletes-Second-Gig.png)

![A deletes it again not found](../screenshots/A-Deletes-It-Again-Not-Found.png)

![Public list gigs no token](../screenshots/Public-List-Gigs-No-Token.png)

![Public get gig by id no token](../screenshots/Public-Get-Gig-By-ID-No-Token.png)

### Gig management — wrong owner and wrong role

| Test | Input | Expected | Result |
|---|---|---|---|
| Update another freelancer's gig | Freelancer B, PUT on freelancer A's gig | 404 Not Found | Pass |
| Delete another freelancer's gig | Freelancer B, DELETE on freelancer A's gig | 404 Not Found | Pass |
| Client creates a gig | Client token, POST /gigs | 403 Forbidden | Pass |
| Client updates a gig | Client token, PUT /gigs/:id | 403 Forbidden | Pass |
| Client deletes a gig | Client token, DELETE /gigs/:id | 403 Forbidden | Pass |
| Client views /gigs/mine | Client token | 403 Forbidden | Pass |

![B updates A's gig not found](../screenshots/B-Updates-As-Gig-Not-Found.png)

![B deletes A's gig not found](../screenshots/B-Deletes-As-Gig-Not-Found.png)

![Client creates gig forbidden](../screenshots/Client-Creates-Gig-Forbidden.png)

![Client updates gig forbidden](../screenshots/Client-Updates-Gig-Forbidden.png)

![Client deletes gig forbidden](../screenshots/Client-Deletes-Gig-Forbidden.png)

![Client lists own gigs forbidden](../screenshots/Client-Lists-Own-Gigs-Forbidden.png)

### Gig validation

| Test | Input | Expected | Result |
|---|---|---|---|
| Missing title | No title field | 400 Bad Request | Pass |
| Negative price | price of -5 | 400 Bad Request | Pass |
| Non-numeric price | price of "abc" | 400 Bad Request | Pass |
| Oversized description | 2001 characters | 400 Bad Request | Pass |
| Oversized title | 121 characters | 400 Bad Request | Pass |
| Update with negative price | price of -1 | 400 Bad Request | Pass |
| Update with invalid isActive | isActive set to "maybe" | 400 Bad Request | Pass |
| GET gig with malformed id | /gigs/abc | 400 or 404 | **Fail (500)** |
| DELETE gig with malformed id | /gigs/abc | 400 or 404 | **Fail (500)** |

![Missing title](../screenshots/Missing-Title.png)

![Negative price](../screenshots/Negative-Price.png)

![Non numeric price](../screenshots/Non-Numeric-Price.png)

![Description too long](../screenshots/Description-Too-Long.png)

![Title too long](../screenshots/Title-Too-Long.png)

![Update with negative price](../screenshots/Update-With-Negative-Price.png)

![Update isActive not boolean](../screenshots/Update-isActive-Not-Boolean.png)

![Malformed gig id get](../screenshots/Malformed-Gig-ID-Get.png)

![Malformed gig id delete](../screenshots/Malformed-Gig-ID-Delete.png)

### Bookings and transactions — POST /api/bookings

| Test | Input | Expected | Result |
|---|---|---|---|
| Client books a gig | Client token + valid gigId | 201 Created, returns booking and transaction | Pass |
| Gig owner tries to book | Freelancer A on their own gig | 403 Forbidden | Pass |
| Other freelancer tries to book | Freelancer B | 403 Forbidden | Pass |
| Invalid gigId | gigId of "abc" | 400 Bad Request | Pass |
| Missing gigId | Empty body | 400 Bad Request | Pass |
| Gig that does not exist | Valid id format, no matching gig | 404 Not Found | Pass |

![Client books A's gig success](../screenshots/Client-Books-As-Gig-Success.png)

![A books own gig forbidden](../screenshots/A-Books-Own-Gig-Forbidden.png)

![B books A's gig forbidden](../screenshots/B-Books-As-Gig-Forbidden.png)

![Invalid gig id](../screenshots/Invalid-Gig-ID.png)

![Missing gig id](../screenshots/Missing-Gig-ID.png)

![Non existent gig](../screenshots/Non-Existent-Gig.png)

### Booking and income views

| Test | Input | Expected | Result |
|---|---|---|---|
| Client views own bookings | GET /bookings/client | 200 OK, includes the booking | Pass |
| Freelancer views bookings on their gigs | GET /bookings/freelancer | 200 OK, includes the booking | Pass |
| Freelancer views income | GET /income (freelancer A) | 200 OK, totalIncome 150, completedBookings 1 | Pass |
| Freelancer with no sales views income | GET /income (freelancer B) | 200 OK, both values 0 | Pass |
| Client views income | GET /income | 403 Forbidden | Pass |
| Client views freelancer bookings | GET /bookings/freelancer | 403 Forbidden | Pass |
| Freelancer views client bookings | GET /bookings/client | 403 Forbidden | Pass |

![Client views own bookings](../screenshots/Client-Views-Own-Bookings.png)

![A views bookings on their gigs](../screenshots/A-Views-Bookings-On-Their-Gigs.png)

![A views income](../screenshots/A-Views-Income.png)

![B views income zero sales](../screenshots/B-Views-Income-Zero-Sales.png)

![Client views income forbidden](../screenshots/Client-Views-Income-Forbidden.png)

![Client views freelancer bookings forbidden](../screenshots/Client-Views-Freelancer-Bookings-Forbidden.png)

![Freelancer views client bookings forbidden](../screenshots/Freelancer-Views-Client-Bookings-Forbidden.png)

### Missing, invalid and expired tokens

| Test | Input | Expected | Result |
|---|---|---|---|
| No token (profile, bookings, income, create gig, create booking) | No Authorization header | 401 Unauthorized | Pass |
| Wrong scheme | Authorization: Token abc | 401 Unauthorized | Pass |
| Malformed token | Bearer abc.def.ghi | 401 Unauthorized | Pass |
| Token with a bad signature | Bearer token with a made-up signature | 401 Unauthorized | Pass |
| Expired token | Correctly signed token that expired an hour ago | 401 Unauthorized, "Session expired" message | Pass |

![Profile no token](../screenshots/Profile-No-Token.png)

![Client bookings no token](../screenshots/Client-Bookings-No-Token.png)

![Income no token](../screenshots/Income-No-Token.png)

![Create gig no token](../screenshots/Create-Gig-No-Token.png)

![Create booking no token](../screenshots/Create-Booking-No-Token.png)

![Wrong auth scheme](../screenshots/Wrong-Auth-Scheme.png)

![Malformed token](../screenshots/Malformed-Token.png)

![Invalid JWT signature](../screenshots/Invalid-JWT-Signature.png)

![Expired JWT](../screenshots/Expired-JWT.png)

### Rate limiting — POST /api/bookings

| Test | Input | Expected | Result |
|---|---|---|---|
| Booking burst | Repeated booking requests from the same client | First 30 allowed, then 429 Too Many Requests with the configured message | Pass |

The booking limiter is set to 30 requests per 15 minutes. Four booking requests had already been counted earlier in the run (one successful booking, two 400s and one 404), then 26 more bookings in the burst returned 201, which makes 30. The very next request returned 429 with the message "Too many booking attempts. Please try again later."

![Booking burst rate limited](../screenshots/Booking-Burst-Rate-Limited.png)

### Newman Run — Terminal Output

The full Newman run was captured in 11 screenshots.

![Newman 1](../screenshots/Newman1.png)

![Newman 2](../screenshots/Newman2.png)

![Newman 3](../screenshots/Newman3.png)

![Newman 4](../screenshots/Newman4.png)

![Newman 5](../screenshots/Newman5.png)

![Newman 6](../screenshots/Newman6.png)

![Newman 7](../screenshots/Newman7.png)

![Newman 8](../screenshots/Newman8.png)

![Newman 9](../screenshots/Newman9.png)

![Newman 10](../screenshots/Newman10.png)

![Newman 11](../screenshots/Newman11.png)

## Security-Specific Notes

A lot of these tests were about checking that the API actually blocks things it shouldn't allow, not just that the endpoints work. Role-based access control was enforced everywhere, with every role mismatch rejected with a 403, and the role check runs before anything else in the route. Ownership violations return a 404 "Gig not found" instead of a 403 on purpose, so someone can't use the error message to work out which gig ids belong to other people. Booking your own gig can't actually be reached through the API since freelancers get a 403 on /bookings before the controller runs, though the controller does also have its own check as a second layer of protection. JWT handling gives different messages for a missing, invalid and expired token, but none of them leak anything about how the token is built, and the expired token test used a correctly signed token with a past expiry so it was really testing the expiry itself. Bad gig input is rejected with a 400 before it gets near the database, and the messages say what was wrong without exposing anything internal. The rate limiter sits after the auth and role checks, so only real client booking requests count towards the 30, and it counts per IP (the default for express-rate-limit) rather than per account.

## Issues Found

Two issues were found. Malformed gig ids return a 500: sending a request like GET /api/gigs/abc or DELETE /api/gigs/abc makes Mongoose throw an error when it tries to look up an id that isn't a valid ObjectId, and the error handler doesn't treat that as an expected error, so the API returns a 500 instead of a 400 or 404. No internal details are leaked, but a bad id from the user shouldn't count as a server error, and the fix would be to check `mongoose.isValidObjectId(req.params.id)` in the gig controller. This was reported to the backend developer. The second issue is that a price of 0 is accepted, which comes from reading the validation code rather than a Newman test: the price check uses `min: 0` but the error message says "Price must be a positive number", so the message and the rule don't quite match.

## Testing Method

All endpoints were tested using a Postman collection (postman/HustleHub-Part2.postman_collection.json), which was also run from the terminal with Newman using `newman run HustleHub-Part2.postman_collection.json --insecure` because the backend runs on a self-signed HTTPS certificate locally, same as Part 1. The full terminal output was saved to newman-output.txt as evidence, and screenshots were taken of the key requests in Postman showing the endpoint, the request body, the response body and the status code. Each request has test scripts that check the status code and response message, and some also check the response data, for example that a booking returns both a booking and a transaction and that the income total matches the price of the gig. Test accounts and gig ids are saved as collection variables during the run, so requests can depend on each other without anything being typed in by hand, and the server was restarted before the final run so the rate limit counters started from zero, with the rate limiting folder kept last so it doesn't block the other booking tests.