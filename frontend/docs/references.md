# HustleHub+ — Frontend References

**Module:** INSY7314  
**Project:** HustleHub+ — Secure Freelance Marketplace  
**Frontend scope:** React interface, routing, authentication state, API integration, user interaction, security and testing.

*Access dates for online sources: 10 October 2026.*

## 1. React and component-based development

1. Meta Platforms, Inc. (n.d.) *React Documentation*. Available at: https://react.dev/ (Accessed: 10 October 2026).  
   Relevance: Building reusable interface components and rendering dynamic marketplace content.

2. Meta Platforms, Inc. (n.d.) *Your First Component*. Available at: https://react.dev/learn/your-first-component (Accessed: 10 October 2026).  
   Relevance: Structuring the frontend into reusable components for pages, forms and interface elements.

3. Meta Platforms, Inc. (n.d.) *Passing Props to a Component*. Available at: https://react.dev/learn/passing-props-to-a-component (Accessed: 10 October 2026).  
   Relevance: Passing gig information, booking details and other data between React components.

4. Meta Platforms, Inc. (n.d.) *Managing State*. Available at: https://react.dev/learn/managing-state (Accessed: 10 October 2026).  
   Relevance: Managing user interactions, form values, loading states and displayed results.

5. Meta Platforms, Inc. (n.d.) *Sharing State Between Components*. Available at: https://react.dev/learn/sharing-state-between-components (Accessed: 10 October 2026).  
   Relevance: Coordinating state across related interface components.

6. Meta Platforms, Inc. (n.d.) *Synchronizing with Effects*. Available at: https://react.dev/learn/synchronizing-with-effects (Accessed: 10 October 2026).  
   Relevance: Understanding effects used to coordinate component state with external systems where appropriate.

7. Meta Platforms, Inc. (n.d.) *Responding to Events*. Available at: https://react.dev/learn/responding-to-events (Accessed: 10 October 2026).  
   Relevance: Handling button clicks, form submissions and user actions.

8. Meta Platforms, Inc. (n.d.) *Conditional Rendering*. Available at: https://react.dev/learn/conditional-rendering (Accessed: 10 October 2026).  
   Relevance: Displaying different screens and interface elements based on authentication, role and application state.

## 2. Navigation and application structure

9. React Router contributors (n.d.) *React Router Documentation*. Available at: https://reactrouter.com/ (Accessed: 10 October 2026).  
   Relevance: Client-side navigation between login, registration, gig browsing, booking and dashboard pages.

10. React Router contributors (n.d.) *Routing*. Available at: https://reactrouter.com/start/declarative/routing (Accessed: 10 October 2026).  
    Relevance: Defining application routes and connecting URLs to frontend pages.

11. React Router contributors (n.d.) *Navigate*. Available at: https://reactrouter.com/api/components/Navigate (Accessed: 10 October 2026).  
    Relevance: Redirecting users when the frontend requires a login or another navigation destination.

12. Vite contributors (n.d.) *Vite Guide*. Available at: https://vite.dev/guide/ (Accessed: 10 October 2026).  
    Relevance: Frontend development server, build process and project configuration.

13. Vite contributors (n.d.) *Vite Configuration Reference*. Available at: https://vite.dev/config/ (Accessed: 10 October 2026).  
    Relevance: Configuring the development server, preview server and frontend build.

14. Vite contributors (n.d.) *Env Variables and Modes*. Available at: https://vite.dev/guide/env-and-mode (Accessed: 10 October 2026).  
    Relevance: Configuring frontend environment variables, including the API base URL through `VITE_API_URL`.

## 3. Frontend-to-backend API communication

15. MDN Web Docs (n.d.) *Fetch API*. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API (Accessed: 10 October 2026).  
    Relevance: Sending HTTP requests from the React frontend to the backend API.

16. MDN Web Docs (n.d.) *Using the Fetch API*. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch (Accessed: 10 October 2026).  
    Relevance: Handling asynchronous API calls, HTTP responses and request failures.

17. MDN Web Docs (n.d.) *HTTP Request Methods*. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods (Accessed: 10 October 2026).  
    Relevance: Understanding GET, POST, PUT and DELETE requests used by marketplace functionality.

18. MDN Web Docs (n.d.) *HTTP Response Status Codes*. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status (Accessed: 10 October 2026).  
    Relevance: Handling successful requests and errors such as 400, 401, 403, 404, 429 and 500 responses.

19. MDN Web Docs (n.d.) *JSON*. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON (Accessed: 10 October 2026).  
    Relevance: Encoding and decoding JSON request bodies and API responses.

20. MDN Web Docs (n.d.) *Cross-Origin Resource Sharing (CORS)*. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS (Accessed: 10 October 2026).  
    Relevance: Understanding browser restrictions when the frontend and backend run on different origins.

21. MDN Web Docs (n.d.) *HTTP Authentication*. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication (Accessed: 10 October 2026).  
    Relevance: Understanding HTTP authentication concepts and bearer-token request headers.

## 4. Authentication and protected routes

22. Auth0 (n.d.) *Introduction to JSON Web Tokens*. Available at: https://jwt.io/introduction (Accessed: 10 October 2026).  
    Relevance: Understanding the JWT supplied by the backend after successful login.

23. IETF (2015) *The OAuth 2.0 Authorization Framework: Bearer Token Usage, RFC 6750*. Available at: https://www.rfc-editor.org/rfc/rfc6750 (Accessed: 10 October 2026).  
    Relevance: The use of bearer tokens in HTTP authorisation headers.

24. OWASP Foundation (n.d.) *JSON Web Token for Java Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html (Accessed: 10 October 2026).  
    Relevance: General JWT security considerations. The guidance is written for Java and should not be treated as a React implementation guide.

25. OWASP Foundation (n.d.) *HTML5 Security Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html (Accessed: 10 October 2026).  
    Relevance: Client-side storage risks and safer handling of sensitive authentication data.

26. OWASP Foundation (n.d.) *Authorization Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html (Accessed: 10 October 2026).  
    Relevance: Understanding why frontend route guards must be supported by server-side role and ownership checks.

27. React Router contributors (n.d.) *Outlet*. Available at: https://reactrouter.com/api/components/Outlet (Accessed: 10 October 2026).  
    Relevance: Nested route layouts, where used in the application.

## 5. Frontend security and safe rendering

28. OWASP Foundation (n.d.) *Cross Site Scripting Prevention Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html (Accessed: 10 October 2026).  
    Relevance: Preventing untrusted gig descriptions and other user-supplied values from being interpreted as executable HTML or scripts.

29. OWASP Foundation (n.d.) *Content Security Policy Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html (Accessed: 10 October 2026).  
    Relevance: Restricting the sources from which scripts, styles, images and network connections may load.

30. MDN Web Docs (n.d.) *Content Security Policy (CSP)*. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP (Accessed: 10 October 2026).  
    Relevance: Understanding CSP directives and browser enforcement.

31. MDN Web Docs (n.d.) *Content-Security-Policy HTTP Header*. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy (Accessed: 10 October 2026).  
    Relevance: Configuring CSP as an HTTP response header.

32. MDN Web Docs (n.d.) *Strict-Transport-Security HTTP Header*. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security (Accessed: 10 October 2026).  
    Relevance: Understanding HSTS for HTTPS deployments. This is a deployment consideration rather than a claim that the local frontend server enables HSTS.

33. Helmet contributors (n.d.) *Helmet Documentation*. Available at: https://helmetjs.github.io/ (Accessed: 10 October 2026).  
    Relevance: Backend security headers that complement frontend security controls.

34. MDN Web Docs (n.d.) *Subresource Integrity*. Available at: https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity (Accessed: 10 October 2026).  
    Relevance: Understanding integrity checks for externally hosted resources if such resources are introduced.

35. OWASP Foundation (n.d.) *Session Management Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html (Accessed: 10 October 2026).  
    Relevance: Session lifecycle, token exposure and client-side authentication considerations.

## 6. Frontend testing and quality assurance

36. Jest contributors (n.d.) *Jest Documentation*. Available at: https://jestjs.io/docs/getting-started (Accessed: 10 October 2026).  
    Relevance: Automated JavaScript tests for frontend components and application behaviour.

37. Testing Library contributors (n.d.) *React Testing Library*. Available at: https://testing-library.com/docs/react-testing-library/intro/ (Accessed: 10 October 2026).  
    Relevance: Testing React components through user-visible behaviour and interactions.

38. Testing Library contributors (n.d.) *Querying in React Testing Library*. Available at: https://testing-library.com/docs/queries/about/ (Accessed: 10 October 2026).  
    Relevance: Finding rendered interface elements in component tests.

39. Testing Library contributors (n.d.) *User Event*. Available at: https://testing-library.com/docs/user-event/intro/ (Accessed: 10 October 2026).  
    Relevance: Simulating user actions such as clicking, typing and submitting forms.

40. Jest contributors (n.d.) *Mock Functions*. Available at: https://jestjs.io/docs/mock-functions (Accessed: 10 October 2026).  
    Relevance: Mocking API responses and dependencies during frontend testing.

41. Jest contributors (n.d.) *Code Coverage*. Available at: https://jestjs.io/docs/configuration#collectcoverage-boolean (Accessed: 10 October 2026).  
    Relevance: Collecting code-coverage information for automated tests.

42. Vite contributors (n.d.) *Building for Production*. Available at: https://vite.dev/guide/build (Accessed: 10 October 2026).  
    Relevance: Producing and verifying the frontend's production build.

## 7. Web standards, accessibility and usability

43. World Wide Web Consortium (W3C) (2023) *Web Content Accessibility Guidelines (WCAG) 2.2*. Available at: https://www.w3.org/TR/WCAG22/ (Accessed: 10 October 2026).  
    Relevance: Accessibility considerations for forms, navigation, readable content and interactive controls.

44. MDN Web Docs (n.d.) *HTML Forms*. Available at: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms (Accessed: 10 October 2026).  
    Relevance: Building registration, login and gig-submission forms.

45. MDN Web Docs (n.d.) *ARIA*. Available at: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA (Accessed: 10 October 2026).  
    Relevance: Accessible names, roles and states for interface elements where native HTML alone is insufficient.

46. W3C (n.d.) *Web Accessibility Initiative*. Available at: https://www.w3.org/WAI/ (Accessed: 10 October 2026).  
    Relevance: General web accessibility principles and practical guidance.

## 8. Version control and project documentation

47. Git (n.d.) *Git Documentation*. Available at: https://git-scm.com/doc (Accessed: 10 October 2026).  
    Relevance: Version control, branch management and collaboration.

48. GitHub (n.d.) *GitHub Documentation*. Available at: https://docs.github.com/ (Accessed: 10 October 2026).  
    Relevance: Repository management, code reviews and project collaboration.

49. GitHub (n.d.) *About Pull Requests*. Available at: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests (Accessed: 10 October 2026).  
    Relevance: Reviewing frontend changes before merging them into the shared project branch.

50. ST10266958 (2026) *INSY7314-HustleHub: Project Repository and README*. Available at: https://github.com/ST10266958/INSY7314-HustleHub (Accessed: 10 October 2026).  
    Relevance: The project's documented frontend structure, API integration, security measures and testing scope.

