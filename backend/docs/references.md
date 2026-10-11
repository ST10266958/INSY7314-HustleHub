# HustleHub+ — Backend References

**Module:** INSY7314  
**Project:** HustleHub+ — Secure Freelance Marketplace  
**Backend contributors:** Andisa and Gia  
**Purpose:** References supporting backend architecture, API development, database integration, authentication, authorisation, security and testing.

*Access dates for online sources: 10 October 2026.*

## 1. Backend architecture and runtime

1. OpenJS Foundation (n.d.) *Node.js Documentation*. Available at: https://nodejs.org/en/docs (Accessed: 10 October 2026).  
   Relevance: Node.js runtime, HTTPS server configuration, environment variables and asynchronous request processing.

2. OpenJS Foundation (n.d.) *Express.js Documentation*. Available at: https://expressjs.com/ (Accessed: 10 October 2026).  
   Relevance: REST API routing, middleware, HTTP request handling and error handling.

3. Express.js (n.d.) *Using Middleware*. Available at: https://expressjs.com/en/guide/using-middleware.html (Accessed: 10 October 2026).  
   Relevance: Middleware ordering, request processing and application-level security controls.

4. Express.js (n.d.) *Error Handling*. Available at: https://expressjs.com/en/guide/error-handling.html (Accessed: 10 October 2026).  
   Relevance: Centralised error handling and consistent API error responses.

5. npm, Inc. (n.d.) *npm Documentation*. Available at: https://docs.npmjs.com/ (Accessed: 10 October 2026).  
   Relevance: Dependency installation, package management, scripts and lockfiles.

6. dotenv contributors (n.d.) *dotenv — Loads Environment Variables from .env*. Available at: https://github.com/motdotla/dotenv (Accessed: 10 October 2026).  
   Relevance: Loading local environment configuration without hardcoding secrets into application files.

## 2. Database and data modelling

7. MongoDB, Inc. (n.d.) *MongoDB Manual*. Available at: https://www.mongodb.com/docs/manual/ (Accessed: 10 October 2026).  
   Relevance: Document storage, collections, querying and database operations.

8. MongoDB, Inc. (n.d.) *MongoDB Atlas Documentation*. Available at: https://www.mongodb.com/docs/atlas/ (Accessed: 10 October 2026).  
   Relevance: Cloud database configuration, network access, database users and secure connectivity.

9. MongoDB, Inc. (n.d.) *MongoDB Node.js Driver Documentation*. Available at: https://www.mongodb.com/docs/drivers/node/current/ (Accessed: 10 October 2026).  
   Relevance: Database connectivity and interaction between Node.js applications and MongoDB.

10. Automattic (n.d.) *Mongoose Documentation*. Available at: https://mongoosejs.com/docs/ (Accessed: 10 October 2026).  
    Relevance: Mongoose models, schemas, validation, references and persistence for users, gigs, bookings and transactions.

11. Automattic (n.d.) *Mongoose Schema Types*. Available at: https://mongoosejs.com/docs/schematypes.html (Accessed: 10 October 2026).  
    Relevance: Defining field types, defaults, required values and schema constraints.

12. Automattic (n.d.) *Mongoose Validation*. Available at: https://mongoosejs.com/docs/validation.html (Accessed: 10 October 2026).  
    Relevance: Database-model validation and protection against invalid persisted records.

13. Automattic (n.d.) *Mongoose Populate*. Available at: https://mongoosejs.com/docs/populate.html (Accessed: 10 October 2026).  
    Relevance: Referencing related MongoDB documents where population is used.

14. MongoDB, Inc. (n.d.) *MongoDB Security Documentation*. Available at: https://www.mongodb.com/docs/manual/security/ (Accessed: 10 October 2026).  
    Relevance: Database access controls, authentication, network restrictions and secure database configuration.

## 3. Authentication and password protection

15. OWASP Foundation (n.d.) *Password Storage Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html (Accessed: 10 October 2026).  
    Relevance: Secure password hashing, password storage and avoiding plaintext credentials.

16. OWASP Foundation (n.d.) *Authentication Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html (Accessed: 10 October 2026).  
    Relevance: Login validation, authentication responses and secure account access.

17. OWASP Foundation (n.d.) *Credential Stuffing Prevention Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html (Accessed: 10 October 2026).  
    Relevance: Understanding automated credential attacks and the value of rate limiting and secure authentication practices.

18. bcrypt contributors (n.d.) *bcrypt — A Library to Help You Hash Passwords*. Available at: https://www.npmjs.com/package/bcrypt (Accessed: 10 October 2026).  
    Relevance: Password hashing and password-hash comparison in Node.js.

19. Auth0 (n.d.) *jsonwebtoken — JSON Web Token Implementation for Node.js*. Available at: https://github.com/auth0/node-jsonwebtoken (Accessed: 10 October 2026).  
    Relevance: Signing, verifying and checking the expiry of JWT authentication tokens.

20. Auth0 (n.d.) *Introduction to JSON Web Tokens*. Available at: https://jwt.io/introduction (Accessed: 10 October 2026).  
    Relevance: JWT structure, claims, signatures and token-based authentication.

21. IETF (2015) *JSON Web Token (JWT), RFC 7519*. Available at: https://www.rfc-editor.org/rfc/rfc7519 (Accessed: 10 October 2026).  
    Relevance: The standard defining JSON Web Tokens.

22. IETF (2020) *JSON Web Token Best Current Practices, RFC 8725*. Available at: https://www.rfc-editor.org/rfc/rfc8725 (Accessed: 10 October 2026).  
    Relevance: JWT implementation risks and secure token-validation practices.

## 4. Authorisation and access control

23. OWASP Foundation (n.d.) *Authorization Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html (Accessed: 10 October 2026).  
    Relevance: Server-side permission checks and restricting access to protected operations.

24. OWASP Foundation (n.d.) *Insecure Direct Object Reference Prevention Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html (Accessed: 10 October 2026).  
    Relevance: Preventing users from accessing or modifying another user's gigs and other resources.

25. OWASP Foundation (2023) *OWASP Top 10:2021 — Broken Access Control*. Available at: https://owasp.org/Top10/A01_2021-Broken_Access_Control/ (Accessed: 10 October 2026).  
    Relevance: Risks associated with missing role checks and insufficient ownership enforcement.

26. OWASP Foundation (n.d.) *REST Security Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html (Accessed: 10 October 2026).  
    Relevance: API authorisation, HTTP security, input handling and appropriate response codes.

## 5. Input validation and application security

27. express-validator contributors (n.d.) *express-validator Documentation*. Available at: https://express-validator.github.io/docs/ (Accessed: 10 October 2026).  
    Relevance: Validating and sanitising registration, login, gig and booking request data.

28. OWASP Foundation (n.d.) *Input Validation Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html (Accessed: 10 October 2026).  
    Relevance: Validating user-supplied data before processing it in controllers or database operations.

29. OWASP Foundation (n.d.) *Error Handling Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html (Accessed: 10 October 2026).  
    Relevance: Avoiding the exposure of stack traces, internal paths and sensitive configuration information.

30. Helmet contributors (n.d.) *Helmet Documentation*. Available at: https://helmetjs.github.io/ (Accessed: 10 October 2026).  
    Relevance: HTTP security headers and Content Security Policy configuration.

31. express-rate-limit contributors (n.d.) *express-rate-limit Documentation*. Available at: https://express-rate-limit.mintlify.app/ (Accessed: 10 October 2026).  
    Relevance: Limiting repeated requests to authentication and booking endpoints.

32. MDN Web Docs (n.d.) *Cross-Origin Resource Sharing (CORS)*. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS (Accessed: 10 October 2026).  
    Relevance: Restricting cross-origin requests to approved frontend origins.

33. OWASP Foundation (2021) *OWASP Top 10:2021*. Available at: https://owasp.org/Top10/ (Accessed: 10 October 2026).  
    Relevance: General web application risks, including injection, security misconfiguration and access control weaknesses.

34. OWASP Foundation (n.d.) *Logging Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html (Accessed: 10 October 2026).  
    Relevance: Security event logging while avoiding the disclosure of passwords, tokens and other sensitive information.

## 6. HTTPS, TLS and secure communications

35. Node.js (n.d.) *HTTPS*. Available at: https://nodejs.org/api/https.html (Accessed: 10 October 2026).  
    Relevance: Configuring the HTTPS server and encrypted communication between the frontend and API.

36. Node.js (n.d.) *TLS (SSL)*. Available at: https://nodejs.org/api/tls.html (Accessed: 10 October 2026).  
    Relevance: TLS certificates and secure transport configuration.

37. MDN Web Docs (n.d.) *HTTPS*. Available at: https://developer.mozilla.org/en-US/docs/Glossary/HTTPS (Accessed: 10 October 2026).  
    Relevance: Understanding encrypted HTTP communication and protection of data in transit.

38. OWASP Foundation (n.d.) *Transport Layer Security Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html (Accessed: 10 October 2026).  
    Relevance: Secure TLS deployment and transport-layer protection.

## 7. API testing and quality assurance

39. Postman, Inc. (n.d.) *Postman Documentation*. Available at: https://learning.postman.com/docs/ (Accessed: 10 October 2026).  
    Relevance: Creating API requests, managing authentication tokens and testing API responses.

40. Postman, Inc. (n.d.) *Writing Tests in Postman*. Available at: https://learning.postman.com/docs/tests-and-scripts/write-scripts/test-scripts/ (Accessed: 10 October 2026).  
    Relevance: Assertions for status codes, response bodies, validation failures and access-control behaviour.

41. Postman, Inc. (n.d.) *Newman Documentation*. Available at: https://github.com/postmanlabs/newman (Accessed: 10 October 2026).  
    Relevance: Running Postman collections through the command line and retaining repeatable API test evidence.

42. Jest contributors (n.d.) *Jest Documentation*. Available at: https://jestjs.io/docs/getting-started (Accessed: 10 October 2026).  
    Relevance: Automated JavaScript testing where Jest is used for backend or shared-code tests.

43. npm, Inc. (n.d.) *npm audit*. Available at: https://docs.npmjs.com/cli/commands/npm-audit (Accessed: 10 October 2026).  
    Relevance: Identifying reported vulnerabilities in installed Node.js dependencies.

## 8. Software engineering and version control

44. Git (n.d.) *Git Documentation*. Available at: https://git-scm.com/doc (Accessed: 10 October 2026).  
    Relevance: Version control, branching, commits and collaborative development.

45. GitHub (n.d.) *GitHub Documentation*. Available at: https://docs.github.com/ (Accessed: 10 October 2026).  
    Relevance: Repository management, pull requests, code review and collaboration.

46. GitHub (n.d.) *About Pull Requests*. Available at: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests (Accessed: 10 October 2026).  
    Relevance: Reviewing and merging backend contributions through a controlled team workflow.

47. Docker, Inc. (n.d.) *Docker Documentation*. Available at: https://docs.docker.com/ (Accessed: 10 October 2026).  
    Relevance: Containerisation concepts relevant to the project's planned deployment and DevSecOps work.

48. GitHub (n.d.) *GitHub Actions Documentation*. Available at: https://docs.github.com/en/actions (Accessed: 10 October 2026).  
    Relevance: Automated build, testing and security-check workflows planned for a later project phase.

## 9. Project-specific documentation

49. ST10266958 (2026) *INSY7314-HustleHub: Project Repository and README*. Available at: https://github.com/ST10266958/INSY7314-HustleHub (Accessed: 10 October 2026).  
    Relevance: Project-specific architecture, endpoints, technology stack, implementation scope and testing instructions.

