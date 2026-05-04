import { useEffect } from 'react'

import { mockOfficeSnapshot } from '../data/mockOffice'
import { useOfficeStore } from '../store/useOfficeStore'

export function useOfficePolling() {
  const hydrate = useOfficeStore((state) => state.hydrate)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const res = await fetch('/api/office-state', {
          headers: { Accept: 'application/json' },
        })
        const contentType = res.headers.get('content-type') ?? ''
        if (!res.ok || !contentType.includes('application/json')) {
          if (active) hydrate(mockOfficeSnapshot)
          return
        }
        const data = await res.json()
        if (active) hydrate(data)
      } catch {
        if (active) hydrate(mockOfficeSnapshot)
      }
    }

    load()
    const id = window.setInterval(load, 15000)
    return () => {
      active = false
      window.clearInterval(id)
    }
  }, [hydrate])
}
