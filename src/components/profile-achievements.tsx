import type { Achievement } from '../types/fighter'

type ProfileAchievementsProps = {
  achievements: Achievement[]
}

export function ProfileAchievements(props: ProfileAchievementsProps) {
  const { achievements } = props

  return (
    <section className="perfil-palmares" aria-labelledby="palmares-titulo">
      <h2 className="perfil-h2" id="palmares-titulo">
        Palmarés
      </h2>
      {achievements.length === 0 ? (
        <p className="palmares-vacio">Todavía no tiene logros registrados.</p>
      ) : (
        <ul className="palmares-lista">
          {achievements.map((achievement) => (
            <li
              key={`${achievement.title}-${achievement.year}`}
              className="logro"
            >
              <div className="logro-cab">
                <h3 className="logro-titulo">{achievement.title}</h3>
                <span className="logro-anio">{achievement.year}</span>
              </div>
              <p className="logro-org">
                {achievement.organization} · Nivel{' '}
                {achievement.level.toLowerCase()}
              </p>
              {achievement.description !== null && (
                <p className="logro-desc">{achievement.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}