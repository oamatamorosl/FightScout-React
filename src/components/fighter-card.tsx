import { Link } from 'react-router'

import type { Fighter } from '../types/fighter'

type FighterCardProps = {
  data: Fighter
}

export function FighterCard(props: FighterCardProps) {
  const { data } = props

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
        <Link className="btn btn-primario" to={`/fighters/${data.id}`}>
          Ver detalle
        </Link>
      </div>
    </li>
  )
}