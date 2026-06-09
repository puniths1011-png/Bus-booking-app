import React from 'react'
import { Bus, User, Ticket } from 'lucide-react'

const RED = '#D84E55'

function Navbar({ user, setUser }) {
  const handleLogout = () => {
    sessionStorage.removeItem('in_current_user')
    setUser(null)
    window.location.reload()
  }

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="navbar navbar-expand-lg border-bottom sticky-top py-3" style={{ backgroundColor: '#fff7ed' }}>
      <div className="container">
        <a className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary fs-4" href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}) }}>
          <div className="bg-primary p-2 rounded-lg text-white">
            <Bus size={28} />
          </div>
          <span>Abhi Bus</span>
        </a>

        <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto gap-2 align-items-center">
            <li className="nav-item">
              <a className="nav-link fw-semibold px-3" href="#search" onClick={(e) => { e.preventDefault(); scrollToSection('search') }}>
                Explore Routes
              </a>
            </li>
            <li className="nav-item me-2">
              <a className="nav-link fw-semibold px-3" href="#admin" onClick={(e) => { e.preventDefault(); scrollToSection('admin') }}>
                Operator Login
              </a>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            <button 
              className="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-2"
              data-bs-toggle="offcanvas" 
              data-bs-target="#offcanvasBookings"
            >
              <Ticket size={18} />
              My Bookings
            </button>
            <button
              onClick={() => window.openAccountDrawer && window.openAccountDrawer()}
              title="Account"
              style={{ position: 'relative', background: user ? RED : 'none', border: `2px solid ${user ? RED : '#ccc'}`, borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
            >
              <User size={18} color={user ? '#fff' : '#555'} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
