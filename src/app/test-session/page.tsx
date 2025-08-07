'use client'

import { useSession } from 'next-auth/react'

export default function TestSessionPage() {
  const { data: session, status } = useSession()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Session Test</h1>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold">Status: {status}</h2>
        <h2 className="font-semibold mt-2">Session Data:</h2>
        <pre className="mt-2 text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  )
}
