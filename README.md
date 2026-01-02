# Task Manager Application

A modern, full-featured task management application built with React, offering user authentication, task CRUD operations, and an intuitive dashboard interface.

## 🚀 Features

- **User Authentication**
  - User registration with password strength validation
  - Secure login with JWT token authentication
  - Session management with localStorage

- **Task Management**
  - Create, read, update, and delete tasks
  - Task status tracking (To Do, In Progress, Done)
  - Filter and search tasks by title, description, or status
  - Sorting capabilities across all columns
  - Pagination with customizable page sizes

- **Dashboard**
  - Real-time task overview
  - Interactive table with sorting and filtering
  - Task editing and deletion with confirmation dialogs
  - Responsive design for mobile and desktop

- **User Experience**
  - Toast notifications for user feedback
  - Password strength meter
  - Form validation
  - Intuitive navigation

## 🛠️ Tech Stack

- **Frontend Framework:** React 19.2.0
- **Build Tool:** Vite 7.2.4
- **Routing:** React Router DOM 7.10.1
- **HTTP Client:** Axios 1.13.2
- **UI Components:** React Bootstrap 2.10.10
- **Table Management:** TanStack React Table 8.21.3
- **Form Handling:** React Hook Form 7.68.0 with Yup validation
- **Notifications:** React Toastify 11.0.5
- **Testing:** Vitest 4.0.16 with React Testing Library
- **Package Manager:** Yarn with PnP (Plug'n'Play)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-manager-app
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Configure API endpoint**
   
   The application connects to a backend API at `http://localhost:8080`. Update the API base URL in the following files if your backend runs on a different port:
   - `src/components/LoginForm.jsx`
   - `src/components/RegistrationPage.jsx`
   - `src/components/Dashboard.jsx`

## 🚀 Running the Application

### Development Mode
```bash
yarn dev
```
The application will start at `http://localhost:5173` (or another port if 5173 is in use).

### Production Build
```bash
yarn build
```

### Preview Production Build
```bash
yarn preview
```

## 🧪 Testing

### Run All Tests
```bash
yarn test
```

### Run Tests with Coverage
```bash
yarn test --coverage
```

### Run Tests in Watch Mode
```bash
yarn test --watch
```

### View Coverage Report
After running tests with coverage, open the HTML report:
```bash
Start-Process coverage/index.html  # Windows
open coverage/index.html           # macOS
xdg-open coverage/index.html       # Linux
```

## 📊 Test Coverage

The application maintains excellent test coverage:

- **Overall Coverage:** 96.11%
- **Components:**
  - LoginForm: 100% ✨
  - RegistrationPage: 98.3%
  - Dashboard: 94.59%
  - App: 80%

**Total Test Suites:** 4
**Total Tests:** 59 (all passing ✅)

## 📁 Project Structure

```
task-manager-app/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, logos, and other assets
│   ├── components/        # React components
│   │   ├── Dashboard.jsx
│   │   ├── LoginForm.jsx
│   │   └── RegistrationPage.jsx
│   ├── css/               # Component-specific styles
│   │   ├── App.css
│   │   ├── Dashboard.css
│   │   ├── LoginForm.css
│   │   └── RegistrationPage.css
│   ├── test/              # Test files
│   │   ├── App.test.jsx
│   │   ├── Dashboard.test.jsx
│   │   ├── LoginForm.test.jsx
│   │   ├── RegistrationPage.test.jsx
│   │   └── setup.js
│   ├── App.jsx            # Main application component
│   └── main.jsx           # Application entry point
├── coverage/              # Test coverage reports
├── .pnp.cjs              # Yarn PnP runtime
├── eslint.config.js      # ESLint configuration
├── index.html            # HTML template
├── package.json          # Project dependencies and scripts
├── vite.config.js        # Vite configuration
└── vitest.config.js      # Vitest configuration
```

## 🔌 API Endpoints

The application expects the following backend API endpoints:

### Authentication
- `POST /user/new-registration` - Register a new user
  ```json
  {
    "firstname": "string",
    "lastname": "string",
    "email": "string",
    "password": "string",
    "country": "string",
    "roles": "ROLE_ADMIN"
  }
  ```

- `POST /user/authenticate` - Login user
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
  Response: Returns user name and JWT token in Authorization header

### Tasks
- `GET /v1/getAllTasks` - Get all tasks for authenticated user
- `POST /v1/saveTask` - Create a new task
  ```json
  {
    "title": "string",
    "description": "string",
    "status": "To Do" | "In Progress" | "Done"
  }
  ```
- `PUT /v1/updateTask` - Update existing task
  ```json
  {
    "id": "number",
    "title": "string",
    "description": "string",
    "status": "string"
  }
  ```
- `DELETE /v1/deleteTask/{id}` - Delete a task

**Note:** All task endpoints require Bearer token authentication.

## 🎨 Key Features Explained

### Password Strength Validation
The registration form includes a real-time password strength meter that evaluates:
- Password length (8+ characters recommended)
- Use of lowercase letters
- Use of uppercase letters
- Use of numbers
- Use of special characters (!@#$%^&*)

### Task Filtering and Sorting
- Click column headers to sort
- Use search boxes under each column to filter
- Combine multiple filters for precise results
- Pagination automatically adjusts to filtered results

### Authentication Flow
1. User registers with email and password
2. User logs in and receives JWT token
3. Token is stored in localStorage
4. All API requests include the token in Authorization header
5. User is redirected to login if token is invalid or expired

## 🔒 Security

- JWT token-based authentication
- Tokens stored in localStorage
- Automatic token validation on protected routes
- Password strength enforcement
- Form validation on both client and server side

## 🐛 Known Issues

- None at this time

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Build for production |
| `yarn preview` | Preview production build |
| `yarn test` | Run tests |
| `yarn test --coverage` | Run tests with coverage |
| `yarn lint` | Run ESLint |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is available for educational and development purposes.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📧 Support

For issues and questions, please open an issue in the repository.

---

**Version:** 1.0-RELEASE  
**Last Updated:** January 2026

