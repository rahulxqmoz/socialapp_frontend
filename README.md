# Connectify - Socialmedia App React Frontend

## Getting Started with Create React App and Redux

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) template.

### Deploying to Vercel
- The frontend is hosted on [Vercel](https://vercel.com/), and connected to the backend API via the domain `https://your-backend-domain.com`.
- Ensure that the backend is running and the API endpoints are accessible before connecting the frontend to the backend.

### Environment Variables
Make sure to add the necessary environment variables for API connections:
- `REACT_APP_API_URL`: The URL of your backend API (e.g., `https://your-backend-domain.com`).

You can set these variables in `.env` file in the root directory:
```bash
REACT_APP_API_URL=https://your-backend-domain.com
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.


## Frontend Features
- **User Authentication**: Connects to the backend API for user login and registration.
- **JWT Authentication**: Handles the JWT token for secure communication with the backend.
- **Redux**: Manages the global state of the application, such as user authentication status, user data, and notifications.
- **Responsive UI**: Optimized for both mobile and desktop platforms.
  
## API Endpoints Integration
The frontend connects to the following backend API endpoints:

### User Authentication
- **`/register/`**: User registration endpoint.
- **`/login/`**: User login endpoint.
- **`/token/`**: Obtain JWT token.
- **`/token/refresh/`**: Refresh JWT token.

### Profile Management
- **`/profile/<user_id>/`**: Fetch user profile.
- **`/profile/update/`**: Update profile details.
- **`/password/update/`**: Update user password.

### Admin Functions
- **`/admin/users/`**: List all users (admin-only).
- **`/admin/users/<pk>/block/`**: Block a user (admin-only).

### More Endpoints
For additional endpoints related to other features, please refer to the backend code in the project repository [Backend Repository](https://github.com/rahulxqmoz/SocialMediaAppBackend).

 
## Deployment on Vercel
- `Vercel will automatically deploy the app for every push to the main branch.`
- `The app will be live and connected to your backend API.`


## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

To learn about Redux Toolkit, check out the [Redux documentation](https://redux.js.org/).
