import { useParams } from 'react-router'

import { toFighterId } from '../adapters/to-fighter-id'
import { FighterProfile } from '../components/fighter-profile'
import { fighters } from '../data/fighters'
import { NotFoundPage } from './not-found-page'

export function FighterProfilePage() {
  const params = useParams()

  const fighterId = toFighterId(params.fighterId)
  const fighter = fighters.find((item) => item.id === fighterId)

  if (fighter === undefined) {
    return <NotFoundPage />
  }

  return <FighterProfile fighter={fighter} />
}