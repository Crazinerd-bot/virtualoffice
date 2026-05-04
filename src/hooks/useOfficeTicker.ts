import { useEffect } from 'react'

import { useOfficeStore } from '../store/useOfficeStore'

export function useOfficeTicker() {
  const tickAgents = useOfficeStore((state) => state.tickAgents)

  useEffect(() => {
    const id = window.setInterval(() => {
      tickAgents()
    }, 32)

    return () => window.clearInterval(id)
  }, [tickAgents])
}
