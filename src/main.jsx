import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import Loading from './components/Loading'
import ProtectedRoute from './components/ProtectedRoute'

// Lazy load all pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const PartsListPage = lazy(() => import('./pages/PartsListPage'))
const PartDetailPage = lazy(() => import('./pages/PartDetailPage'))
const BuilderPage = lazy(() => import('./pages/BuilderPage'))
const ForumListPage = lazy(() => import('./pages/ForumListPage'))
const CreatePostPage = lazy(() => import('./pages/CreatePostPage'))
const PostDetailPage = lazy(() => import('./pages/PostDetailPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const ComparePartsPage = lazy(() => import('./pages/ComparePartsPage'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Suspense fallback={<Loading />}><HomePage /></Suspense> },
      { path: 'login', element: <Suspense fallback={<Loading />}><LoginPage /></Suspense> },
      { path: 'register', element: <Suspense fallback={<Loading />}><RegisterPage /></Suspense> },
      { path: 'parts', element: <Suspense fallback={<Loading />}><PartsListPage /></Suspense> },
      { path: 'parts/:id', element: <Suspense fallback={<Loading />}><PartDetailPage /></Suspense> },
      { path: 'compare', element: <Suspense fallback={<Loading />}><ComparePartsPage /></Suspense> },
      { 
        path: 'builder', 
        element: (
          <ProtectedRoute>
            <Suspense fallback={<Loading />}>
              <BuilderPage />
            </Suspense>
          </ProtectedRoute>
        )
      },
      { path: 'forum', element: <Suspense fallback={<Loading />}><ForumListPage /></Suspense> },
      { 
        path: 'forum/create', 
        element: (
          <ProtectedRoute>
            <Suspense fallback={<Loading />}>
              <CreatePostPage />
            </Suspense>
          </ProtectedRoute>
        )
      },
      { path: 'forum/:id', element: <Suspense fallback={<Loading />}><PostDetailPage /></Suspense> },
      { path: 'profile/:userId', element: <Suspense fallback={<Loading />}><ProfilePage /></Suspense> },
      { 
        path: 'admin', 
        element: (
          <ProtectedRoute>
            <Suspense fallback={<Loading />}>
              <AdminPage />
            </Suspense>
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
