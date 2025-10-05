import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, Router } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

import './index.css'

const router = new Router({ routeTree })

ReactDOM.createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />)
