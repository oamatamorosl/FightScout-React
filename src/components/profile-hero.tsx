import type { Fighter } from '../types/fighter'
import { ProfileRecord } from './profile-record'

type ProfileHeroProps = {
    fighter: Fighter
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((word) => word.charAt(0))
        .join('')
}

export function ProfileHero(props: ProfileHeroProps) {
    const { fighter } = props

    const [firstName, ...restOfName] = fighter.name.split(' ')

    return (
        <section className="perfil-hero" aria-labelledby="perfil-nombre">
            <div className="perfil-hero-id">
                <div className="perfil-foto perfil-foto-placeholder" aria-hidden="true">
                    {getInitials(fighter.name)}
                </div>
                <div className="perfil-hero-info">
                    <p className="eyebrow">
                        {fighter.discipline} · {fighter.weightClass}
                    </p>
                    <h1 id="perfil-nombre">
                        {firstName} <span>{restOfName.join(' ')}</span>
                    </h1>
                    <p className="perfil-apodo">«{fighter.nickname}»</p>
                    <ul className="perfil-badges" aria-label="Estado del peleador">
                        <li className="badge">{fighter.competitiveLevel}</li>
                        <li
                            className={
                                fighter.competitiveStatus === 'Activo'
                                    ? 'badge badge-activo'
                                    : 'badge'
                            }
                        >
                            {fighter.competitiveStatus}
                        </li>
                        {fighter.availableToFight && (
                            <li className="badge badge-disponible">Disponible para pelear</li>
                        )}
                    </ul>
                    <p className="perfil-origen">
                        {fighter.residenceCountry} · {fighter.city}
                    </p>
                </div>

            </div>

            <ProfileRecord record={fighter.record} />
        </section>

    )
}