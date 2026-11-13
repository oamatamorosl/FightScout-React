import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <div className="buscar">
      <div className="estado-vacio" role="status">
        <p>No encontramos esta página.</p>
        <Link to="/search" className="btn btn-fantasma">
          Volver a la búsqueda
        </Link>
      </div>
    </div>
  )
}