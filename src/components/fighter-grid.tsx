import type { Fighter } from '../types/fighter'
import { FighterCard } from './fighter-card'

type FighterGridProps = {
  items: Fighter[]
  onSelectFighter: (fighterId: number) => void
}

export function FighterGrid(props: FighterGridProps) {
  const { items, onSelectFighter } = props

  return (
    <ul className="tarjetas-peleadores">
      {items.map((fighter) => (
        <FighterCard
          key={fighter.id}
          data={fighter}
          onSelectFighter={onSelectFighter}
        />
      ))}
    </ul>
  )
}