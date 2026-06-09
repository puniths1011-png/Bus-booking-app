import React, { useState, useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import Hero from './components/ui/Hero'
import StateCards from './components/ui/StateCards'
import SearchSection from './components/features/search/SearchSection'
import AdminSection from './components/features/admin/AdminSection'
import MyBookingsDrawer from './components/features/bookings/MyBookingsDrawer'
import AuthModals from './components/features/auth/AuthModals'
import AccountDrawer from './components/features/account/AccountDrawer'
import StateDetailView from './components/features/states/StateDetailView'


function App() {
  const [user, setUser] = useState(null)
  const [activeState, setActiveState] = useState(null)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('in_current_user')
      if (saved) setUser(JSON.parse(saved))
    } catch (e) {
      console.error("Failed to load user", e)
    }
  }, [])

  const handleOpenAuth = (modalId) => {
    const el = document.querySelector(modalId)
    if (el) {
      import('bootstrap').then(bs => {
        new bs.Modal(el).show()
      })
    }
  }

  const handleStateClick = (stateName) => {
    setActiveState(stateName)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-container">
      <Navbar user={user} setUser={setUser} />
      
      <main>
        {activeState ? (
          <StateDetailView stateName={activeState} onBack={() => setActiveState(null)} user={user} onOpenAuth={handleOpenAuth} />
        ) : (
          <>
            <Hero />
            <StateCards onStateClick={handleStateClick} />
            <section id="search">
              <SearchSection user={user} onOpenAuth={handleOpenAuth} />
            </section>
            <section id="admin">
              <AdminSection />
            </section>
          </>
        )}
      </main>

      <MyBookingsDrawer user={user} />
      <AuthModals setUser={setUser} />
      <AccountDrawer user={user} setUser={setUser} onOpenAuth={handleOpenAuth} />
    </div>
  )
}

export default App
