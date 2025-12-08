import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PartsListPage from './pages/PartsListPage'
import PartDetailPage from './pages/PartDetailPage'
import BuilderPage from './pages/BuilderPage'
import ForumListPage from './pages/ForumListPage'
import CreatePostPage from './pages/CreatePostPage'
import PostDetailPage from './pages/PostDetailPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import ComparePartsPage from './pages/ComparePartsPage'
import ProtectedRoute from './components/ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'parts', element: <PartsListPage /> },
      { path: 'parts/:id', element: <PartDetailPage /> },
      { path: 'compare', element: <ComparePartsPage /> },
      { 
        path: 'builder', 
        element: (
          <ProtectedRoute>
            <BuilderPage />
          </ProtectedRoute>
        )
      },
      { path: 'forum', element: <ForumListPage /> },
      { 
        path: 'forum/create', 
        element: (
          <ProtectedRoute>
            <CreatePostPage />
          </ProtectedRoute>
        )
      },
      { path: 'forum/:id', element: <PostDetailPage /> },
      { path: 'profile/:userId', element: <ProfilePage /> },
      { 
        path: 'admin', 
        element: (
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        )
      },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
