import type { Fighter } from '../types/fighter'
import { ProfileHero } from './profile-hero'
import { ProfileSpecs } from './profile-specs'
import { ProfileStyle } from './profile-style'
import { ProfileAchievements } from './profile-achievements'

type FighterProfileProps = {
  fighter: Fighter
  onBack: () => void
}

export function FighterProfile(props: FighterProfileProps) {
  const { fighter, onBack } = props

  return (
    <main className="perfil">
      <div className="perfil-volver">
        <button type="button" className="btn btn-fantasma" onClick={onBack}>
          Volver a resultados
        </button>
      </div>
      <ProfileHero fighter={fighter} />

      <ProfileSpecs fighter={fighter} />
      <ProfileStyle fighter={fighter} />
      <ProfileAchievements achievements={fighter.achievements} />

    </main>
  )
}