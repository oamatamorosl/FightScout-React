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
    </>
  )
}