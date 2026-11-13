type EmptyStateProps = {
  message: string
  onClear: () => void
}

export function EmptyState(props: EmptyStateProps) {
  const { message, onClear } = props

  return (
    <div className="estado-vacio" role="status">
      <p>{message}</p>
      <button type="button" className="btn btn-fantasma" onClick={onClear}>
        Limpiar búsqueda
      </button>
    </div>
  )
}