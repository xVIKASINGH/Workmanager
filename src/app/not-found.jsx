import React from 'react'
import { Frown } from 'lucide-react'
import Link from 'next/link'

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <div className="flex items-center space-x-4 mb-6">
        <Frown size={40} className="text-red-500" />
        <h1 className="text-4xl font-semibold text-gray-800">404 - Page Not Found</h1>
      </div>
      
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>
      
      <Link 
        href="/"
        className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800  transition font-medium"
      >
        Go to Homepage
      </Link>
    </div>
  )
}

export default NotFound
