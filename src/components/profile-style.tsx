import type { Fighter } from '../types/fighter'

type ProfileStyleProps = {
  fighter: Fighter
}

export function ProfileStyle(props: ProfileStyleProps) {
  const { fighter } = props
  const { martialArts } = fighter

  return (
    <section className="perfil-estilo" aria-labelledby="estilo-titulo">
      <h2 className="perfil-h2" id="estilo-titulo">
        Estilo
      </h2>
      <div className="estilo-tags">
        <span className="tag tag-estilo">{fighter.fightStyle}</span>
      </div>
      {martialArts !== null && (
        <>
          <p className="tags-label">Bases:</p>
          <div className="estilo-tags">
            {martialArts.map((art) => (
              <span key={art} className="tag">
                {art}
              </span>
            ))}
          </div>
        </>
      )}
      <p className="perfil-bio">{fighter.bio}</p>
    </section>
  )
}