import type { Fighter } from '../types/fighter'

type ProfileSpecsProps = {
  fighter: Fighter
}

export function ProfileSpecs(props: ProfileSpecsProps) {
  const { fighter } = props

  const specs = [
    { label: 'Edad', value: `${fighter.age} años` },
    { label: 'Género', value: fighter.sex },
    { label: 'Nacionalidad', value: fighter.nationality },
    {
      label: 'País / Ciudad de residencia',
      value: `${fighter.residenceCountry} / ${fighter.city}`,
    },
    { label: 'Estatura', value: `${fighter.heightCm} cm` },
    { label: 'Alcance', value: `${fighter.reachCm} cm` },
    { label: 'Guardia', value: fighter.stance },
    {
      label: 'Peso / Categoría',
      value: `${fighter.weightKg} kg · ${fighter.weightClass}`,
    },
    { label: 'Gimnasio', value: fighter.gym },
    { label: 'Idiomas', value: fighter.languages.join(', ') },
    { label: 'Debut', value: fighter.debutDate },
    { label: 'Última pelea', value: fighter.lastFightDate },
  ]

  return (
    <section className="perfil-ficha" aria-labelledby="ficha-titulo">
      <h2 className="perfil-h2" id="ficha-titulo">
        Ficha técnica
      </h2>
      <dl className="ficha-lista">
        {specs.map((spec) => (
          <div key={spec.label}>
            <dt>{spec.label}</dt>
            <dd>{spec.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}