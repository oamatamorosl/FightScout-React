import type { Fighter } from '../types/fighter'
import { FighterCard } from './fighter-card'

type FighterGridProps = {
  items: Fighter[]
}

export function FighterGrid(props: FighterGridProps) {
  const { items } = props

  return (
    <ul className="tarjetas-peleadores">
      {items.map((fighter) => (
        <FighterCard key={fighter.id} data={fighter} />
      ))}
    </ul>
  )
}