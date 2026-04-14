import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import Home from './app/Home.tsx'
import Family from './app/Family.tsx'
import ExpenseHome from './app/expense/Home.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/family',
    element: <Family />
  },
  {
    path: '/expense/home',
    element: <ExpenseHome />
  },
  {
    path: '/expense/car',
    element: <Family />
  },
  {
    path: '/expense/living',
    element: <Family />
  },
  {
    path: '/expense/other',
    element: <Family />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
