import { SectionCard } from '../components/shared/SectionCard'
import { StatusBadge } from '../components/shared/Badges'
import type { CommandCenterSnapshot } from '../types'

type PersonnelPageProps = {
  snapshot: CommandCenterSnapshot
}

export function PersonnelPage({ snapshot }: PersonnelPageProps) {
  return (
    <SectionCard title="Personnel" subtitle="Duty roster for the current shift">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Rank</th>
              <th>Post</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.personnel.map((person) => (
              <tr key={person.id}>
                <td className="mono">{person.id}</td>
                <td>{person.name}</td>
                <td>{person.rank}</td>
                <td>{person.post}</td>
                <td>
                  <StatusBadge
                    status={person.status}
                    tone={person.status === 'on-duty' ? 'success' : 'neutral'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}
