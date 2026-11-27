import { Link, Outlet } from 'react-router'

export function PublicLayout() {
  return (
    <>
      <header>
        <Link to="/search" className="marca">
          Fight<span>Scout</span>· Scouting LATAM
        </Link>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <div>
          <p className="marca-footer">
            Fight<span>Scout</span>
          </p>
          <p>
            Versión 2.0 · Análisis de scouting y búsqueda semántica con IA
            (Gemini)
          </p>
        </div>
      </footer>
    </>
  )
}