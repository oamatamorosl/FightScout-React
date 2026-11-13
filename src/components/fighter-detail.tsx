import type { Fighter } from '../types/fighter'

type FighterDetailProps = {
    fighter: Fighter
    onBack: () => void
}

export function FighterDetail(props: FighterDetailProps) {
    const { fighter, onBack } = props

    return (
        <>
            <dl className="ficha-lista fighter-detail">
                <div>
                    <dt>Nombre</dt>
                    <dd>{fighter.name}</dd>
                </div>
                <div>
                    <dt>Apodo</dt>
                    <dd>{fighter.nickname}</dd>
                </div>
                <div>
                    <dt>Disciplina</dt>
                    <dd>{fighter.discipline}</dd>
                </div>
                <div>
                    <dt>Peso</dt>
                    <dd>{fighter.weightKg} kg</dd>
                </div>
                <div>
                    <dt>Ciudad</dt>
                    <dd>{fighter.city}</dd>
                </div>
            </dl>
            <div className="fighter-detail-actions">
                <button type="button" className="btn btn-fantasma" onClick={onBack}>
                    Volver a resultados
                </button>
            </div>
        </>
    )
}