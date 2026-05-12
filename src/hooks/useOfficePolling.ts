import { useEffect, useState } from 'react'

import { useOfficeStore } from '../store/useOfficeStore'

export function useOfficePolling() {
  const hydrate = useOfficeStore((state) => state.hydrate)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const res = await fetch('/api/office-state', {
          headers: { Accept: 'application/json' },
        })
        const contentType = res.headers.get('content-type') ?? ''
        if (!res.ok || !contentType.includes('application/json')) {
          throw new Error(`Office state request failed with ${res.status}`)
        }
        const data = await res.json()
        if (active) {
          hydrate(data)
          setError(null)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load office state')
        }
      }
    }

    load()
    const id = window.setInterval(load, 15000)
    return () => {
      active = false
      window.clearInterval(id)
    }
  }, [hydrate])

  return error
}
