import React from 'react'

const STATES = [
  { name: 'Karnataka', color: '#ffedd5', border: '#fb923c', icon: '🏰', count: '120+ Routes' },
  { name: 'Maharashtra', color: '#fef3c7', border: '#f59e0b', icon: '🚢', count: '150+ Routes' },
  { name: 'Telangana', color: '#ecfdf5', border: '#10b981', icon: '🏛️', count: '80+ Routes' },
  { name: 'Delhi', color: '#eff6ff', border: '#3b82f6', icon: '🚇', count: '100+ Routes' },
  { name: 'Tamil Nadu', color: '#fff1f2', border: '#f43f5e', icon: '🛕', count: '110+ Routes' },
  { name: 'Andhra Pradesh', color: '#f5f3ff', border: '#8b5cf6', icon: '🌊', count: '90+ Routes' }
]

function StateCards({ onStateClick }) {
  return (
    <div className="container py-5 animate-fade">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Explore Top <span className="text-primary">States</span></h2>
        <p className="text-secondary small mb-0">Discover routes across your favorite destinations</p>
      </div>

      <div className="row g-4">
        {STATES.map((state) => (
          <div key={state.name} className="col-6 col-md-4 col-lg-2">
            <div 
              className="card border-0 rounded-4 transition-all hover-up p-4 text-center cursor-pointer shadow-sm"
              onClick={() => onStateClick && onStateClick(state.name)}
              style={{ 
                backgroundColor: state.color, 
                borderLeft: `5px solid ${state.border}`,
                transition: 'transform 0.2s ease'
              }}
            >
              <div className="fs-1 mb-2">{state.icon}</div>
              <h6 className="fw-bold mb-1">{state.name}</h6>
              <div className="smallest text-secondary fw-bold uppercase">{state.count}</div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .hover-up:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important;
        }
        .smallest {
          font-size: 0.7rem;
        }
      `}</style>
    </div>
  )
}

export default StateCards
