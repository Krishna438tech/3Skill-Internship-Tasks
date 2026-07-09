import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Dashboard from "./pages/Dashboard/Dashboard";
import CreateTeam from "./pages/CreateTeam/CreateTeam";
import JoinTeam from "./pages/JoinTeam/JoinTeam";
import CreateQuiz from "./pages/CreateQuiz/CreateQuiz";
import MyQuizzes from "./pages/MyQuizzes/MyQuizzes";
import Leaderboard from "./pages/Leaderboard/Leaderboard";
import Profile from "./pages/Profile/Profile";

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-team"
        element={
          <ProtectedRoute>
            <CreateTeam />
          </ProtectedRoute>
        }
      />

      <Route
        path="/join-team"
        element={
          <ProtectedRoute>
            <JoinTeam />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-quiz"
        element={
          <ProtectedRoute>
            <CreateQuiz />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-quizzes"
        element={
          <ProtectedRoute>
            <MyQuizzes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;