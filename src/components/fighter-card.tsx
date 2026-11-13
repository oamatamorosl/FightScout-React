import type { Fighter } from '../types/fighter'

type FighterCardProps = {
  data: Fighter
  onSelectFighter: (fighterId: number) => void
}

export function FighterCard(props: FighterCardProps) {
  const { data, onSelectFighter } = props

  function handleDetailClick() {
    onSelectFighter(data.id)
  }

  return (
    <li className="tarjeta-peleador">
      <div className="tarjeta-info">
        <p className="tarjeta-nombre">
          {data.name}
          <span className="tarjeta-meta">{data.nickname}</span>
        </p>
        <p className="tarjeta-record">
          {data.discipline} · {data.city}
        </p>
      </div>
      <div className="tarjeta-acciones">
        <button
          type="button"
          className="btn btn-primario"
          onClick={handleDetailClick}
        >
          Ver detalle
        </button>
      </div>
    </li>
  )
}