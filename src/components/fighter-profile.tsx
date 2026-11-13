import { Link } from 'react-router'

import type { Fighter } from '../types/fighter'
import { ProfileAchievements } from './profile-achievements'
import { ProfileHero } from './profile-hero'
import { ProfileSpecs } from './profile-specs'
import { ProfileStyle } from './profile-style'

type FighterProfileProps = {
  fighter: Fighter
}

export function FighterProfile(props: FighterProfileProps) {
  const { fighter } = props

  return (
    <div className="perfil">
      <div className="perfil-volver">
        <Link to="/search" className="btn btn-fantasma">
          Volver a resultados
        </Link>
      </div>
      <ProfileHero fighter={fighter} />
      <ProfileSpecs fighter={fighter} />
      <ProfileStyle fighter={fighter} />
      <ProfileAchievements achievements={fighter.achievements} />
    </div>
  )
}