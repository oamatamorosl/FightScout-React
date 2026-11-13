import type { FighterRecord } from '../types/fighter'

type ProfileRecordProps = {
  record: FighterRecord
}

export function ProfileRecord(props: ProfileRecordProps) {
  const { record } = props
  const { methods } = record

  return (
    <aside className="perfil-record" aria-label="Récord del peleador">
      <div className="record-marcador">
        <div className="record-cifra">
          <span className="record-num">{record.wins}</span>
          <span className="record-lbl">Victorias</span>
        </div>
        <div className="record-cifra">
          <span className="record-num">{record.losses}</span>
          <span className="record-lbl">Derrotas</span>
        </div>
        <div className="record-cifra">
          <span className="record-num">{record.draws}</span>
          <span className="record-lbl">Empates</span>
        </div>
      </div>
      <ul
        className="record-metodos"
        aria-label="Desglose de victorias por método"
      >
        <li>
          <span className="metodo-num">{methods.ko}</span> KO
        </li>
        <li>
          <span className="metodo-num">{methods.tko}</span> TKO
        </li>
        {methods.submission !== null && (
          <li>
            <span className="metodo-num">{methods.submission}</span> Sumisión
          </li>
        )}
        <li>
          <span className="metodo-num">{methods.decision}</span> Decisión
        </li>
        <li>
          <span className="metodo-num">{methods.firstRoundKos}</span>{' '}
          {methods.firstRoundKos === 1 ? 'KO' : 'KOs'} en 1er round
        </li>
      </ul>
    </aside>
  )
}