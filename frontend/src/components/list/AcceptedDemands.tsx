import React, { useState, useEffect } from 'react'
import {
  fetchMyDemands,
  fetchDemandsByIds
} from '../../hooks/api/demandApi'
import Button from '../button/Button'

interface Match {
  id?: string
  demandId: string
  status: string
}

interface Demand {
  demandId: string
  title: string
  demand: string
  category: string
  createdAt: string
  matches: (Match | string)[]
}

const AcceptedDemands: React.FC = () => {
  const [items, setItems] = useState<{ demand: Demand; matches: Match[] }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetchMyDemands()
        const myDemands: Demand[] = resp.data || []

        const out: { demand: Demand; matches: Match[] }[] = []

        for (const d of myDemands) {
          if (!Array.isArray(d.matches) || d.matches.length === 0) continue

          const matchedIds: string[] = []
          const statusMap: Record<string, string> = {}

          for (const m of d.matches) {
            const id = typeof m === 'object' ? m.id : m
            const status = typeof m === 'object' ? m.status : 'new'
            if (id && status === 'matched') {
              matchedIds.push(id)
              statusMap[id] = status
            }
          }

          if (matchedIds.length === 0) continue


          const matchesResp = await fetchDemandsByIds(matchedIds)
          const fetched = Array.isArray(matchesResp.data)
            ? matchesResp.data
            : [matchesResp.data]


          const matchesWithStatus = fetched.map((md: any) => ({
            ...md,
            status: statusMap[md.demandId] || 'matched'
          }))

          out.push({ demand: d, matches: matchesWithStatus })
        }

        setItems(out)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) return <div>Laddar aktiva sammarbeten...</div>
  if (error) return <div>Error: {error}</div>
  if (items.length === 0) return <div>Inga aktiv sammarbeten hittades.</div>

  return (
    <div className="">
      <h2 className="text-xl font-bold mb-4">Aktiva Sammarbeten</h2>
      <ul className="space-y-4">
        {items.map(({ demand, matches }) => (
          <li
            key={demand.demandId}
            className="border p-4 rounded-xl shadow-sm bg-white"
          >
            <div className="flex justify-between items-center">
              <p className="font-semibold text-2xl">{demand.title}</p>
              <p className="text-xs text-gray-700">
              Skapad: {new Date(demand.createdAt).toLocaleString()}
              </p>
            </div>
              <p className="text-base text-gray-600">{demand.demand}</p>


            <div className="mt-4">
              <h3 className="text-lg font-semibold">Matchat Med:</h3>
              {matches.length === 0 ? (
                <p>Inga aktiva sammarbeten.</p>
              ) : (
                <ul className="space-y-2 mt-2 ">
                  {matches.map((match: any) => (
                   <li key={match.demandId} className="flex justify-between items-center text-sm text-gray-700">
                   <span>{match.title} - {match.status}</span>
                 
                   <Button 
                     onClick={() => ("")}
                     label="Välj"
                     className="py-1.5 px-4"
                   />
                 </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AcceptedDemands
