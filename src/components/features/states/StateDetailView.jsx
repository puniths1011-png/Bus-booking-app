import React, { useState } from 'react'
import { ArrowLeft, MapPin, Search, Bus, Star, ShieldCheck, X } from 'lucide-react'
import { CITIES, ROUTE_FARES, BUS_CATALOG, COACH_MULTIPLIER } from '../../../constants'
import BookingSection from '../search/BookingSection'

const STATE_DATA = {
  'Karnataka': {
    image: '/karanatake.jpg',
    icon: '🏰',
    routeCount: '120+ Routes',
    heritage: 'Virupaksha Temple, Hampi',
    cities: [
      { from: 'Bengaluru', to: 'Mysuru', price: 299 },
      { from: 'Bengaluru', to: 'Mangaluru', price: 699 },
      { from: 'Bengaluru', to: 'Hubli', price: 550 },
      { from: 'Mysuru', to: 'Coorg', price: 450 },
      { from: 'Bengaluru', to: 'Hampi', price: 850 },
      { from: 'Mangaluru', to: 'Gokarna', price: 400 },
      { from: 'Bengaluru', to: 'Belagavi', price: 750 },
      { from: 'Hubli', to: 'Dharwad', price: 150 },
      { from: 'Bengaluru', to: 'Udupi', price: 700 },
      { from: 'Bengaluru', to: 'Shimoga', price: 480 }
    ]
  },
  'Maharashtra': {
    image: '/Maharastra.jpg',
    icon: '🚢',
    routeCount: '150+ Routes',
    heritage: 'Ajanta Caves, Aurangabad',
    cities: [
      { from: 'Mumbai', to: 'Pune', price: 350 },
      { from: 'Mumbai', to: 'Nagpur', price: 1200 },
      { from: 'Pune', to: 'Nashik', price: 400 },
      { from: 'Mumbai', to: 'Shirdi', price: 550 },
      { from: 'Pune', to: 'Aurangabad', price: 450 },
      { from: 'Mumbai', to: 'Mahabaleshwar', price: 600 },
      { from: 'Nagpur', to: 'Amravati', price: 300 },
      { from: 'Mumbai', to: 'Kolhapur', price: 800 },
      { from: 'Pune', to: 'Ratnagiri', price: 550 },
      { from: 'Nashik', to: 'Shirdi', price: 250 }
    ]
  },
  'Telangana': {
    image: '/Telngana.jpg',
    icon: '🏛️',
    routeCount: '80+ Routes',
    heritage: 'Charminar, Hyderabad',
    cities: [
      { from: 'Hyderabad', to: 'Warangal', price: 250 },
      { from: 'Hyderabad', to: 'Nizamabad', price: 350 },
      { from: 'Hyderabad', to: 'Khammam', price: 400 },
      { from: 'Hyderabad', to: 'Karimnagar', price: 300 },
      { from: 'Hyderabad', to: 'Ramagundam', price: 450 },
      { from: 'Hyderabad', to: 'Mahbubnagar', price: 200 },
      { from: 'Warangal', to: 'Hyderabad', price: 250 },
      { from: 'Hyderabad', to: 'Nalgonda', price: 220 },
      { from: 'Hyderabad', to: 'Adilabad', price: 650 },
      { from: 'Hyderabad', to: 'Suryapet', price: 280 }
    ]
  },
  'Delhi': {
    image: '/Delhi.jpg',
    icon: '🚇',
    routeCount: '100+ Routes',
    heritage: 'Qutub Minar, New Delhi',
    cities: [
      { from: 'Delhi', to: 'Jaipur', price: 450 },
      { from: 'Delhi', to: 'Agra', price: 350 },
      { from: 'Delhi', to: 'Chandigarh', price: 400 },
      { from: 'Delhi', to: 'Dehradun', price: 550 },
      { from: 'Delhi', to: 'Haridwar', price: 500 },
      { from: 'Delhi', to: 'Manali', price: 1200 },
      { from: 'Delhi', to: 'Shimla', price: 850 },
      { from: 'Delhi', to: 'Ludhiana', price: 450 },
      { from: 'Delhi', to: 'Amritsar', price: 750 },
      { from: 'Delhi', to: 'Nainital', price: 650 }
    ]
  },
  'Tamil Nadu': {
    image: '/Tamilnadu.jpg',
    icon: '🛕',
    routeCount: '110+ Routes',
    heritage: 'Shore Temple, Mahabalipuram',
    cities: [
      { from: 'Chennai', to: 'Coimbatore', price: 650 },
      { from: 'Chennai', to: 'Madurai', price: 550 },
      { from: 'Chennai', to: 'Trichy', price: 450 },
      { from: 'Chennai', to: 'Salem', price: 400 },
      { from: 'Chennai', to: 'Pondicherry', price: 300 },
      { from: 'Coimbatore', to: 'Ooty', price: 250 },
      { from: 'Chennai', to: 'Vellore', price: 200 },
      { from: 'Chennai', to: 'Kanyakumari', price: 950 },
      { from: 'Madurai', to: 'Rameshwaram', price: 350 },
      { from: 'Chennai', to: 'Tirunelveli', price: 700 }
    ]
  },
  'Andhra Pradesh': {
    image: '/Andrapradesh.jpg',
    icon: '🌊',
    routeCount: '90+ Routes',
    heritage: 'Venkateswara Temple, Tirumala',
    cities: [
      { from: 'Vijayawada', to: 'Visakhapatnam', price: 750 },
      { from: 'Hyderabad', to: 'Vijayawada', price: 450 },
      { from: 'Hyderabad', to: 'Visakhapatnam', price: 950 },
      { from: 'Tirupati', to: 'Chennai', price: 350 },
      { from: 'Vijayawada', to: 'Guntur', price: 100 },
      { from: 'Visakhapatnam', to: 'Vijayawada', price: 750 },
      { from: 'Hyderabad', to: 'Tirupati', price: 850 },
      { from: 'Nellore', to: 'Chennai', price: 300 },
      { from: 'Vijayawada', to: 'Nellore', price: 400 },
      { from: 'Kurnool', to: 'Hyderabad', price: 350 }
    ]
  }
}

function StateDetailView({ stateName, onBack, user, onOpenAuth }) {
  const data = STATE_DATA[stateName] || STATE_DATA['Karnataka']
  
  const [search, setSearch] = useState({
    from: data.cities[0].from,
    to: data.cities[0].to,
    date: new Date().toISOString().split('T')[0]
  })
  
  const [activeTrip, setActiveTrip] = useState(null)

  const handleBookNow = (route) => {
    if (!user) {
      onOpenAuth('#loginModal')
      return
    }
    // Generate a valid trip object for the BookingSection
    const trip = {
      id: `${route.from}-${route.to}-${Date.now()}`,
      bus: 'Abhi Bus Express',
      coach: 'AC Sleeper',
      from: route.from,
      to: route.to,
      date: search.date,
      depTime: '09:30 PM',
      price: route.price,
      seatsLeft: 24,
      amenities: ['WiFi', 'AC', 'Charging']
    }
    setActiveTrip(trip)
  }

  return (
    <div className="animate-fade pb-5">
      {/* Hero Section */}
      <div 
        className="position-relative"
        style={{
          height: '400px',
          background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url("${data.image}") center/cover no-repeat`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          imageRendering: '-webkit-optimize-contrast',
          backgroundColor: '#1a1a1a'
        }}
      >
        <button 
          onClick={onBack}
          className="btn btn-light position-absolute top-0 start-0 m-4 rounded-pill d-flex align-items-center gap-2 px-3 fw-bold shadow-sm"
          style={{ zIndex: 10 }}
        >
          <ArrowLeft size={18} /> Back to Home
        </button>

        <div className="text-center text-white">
          <div className="display-4 mb-2">{data.icon}</div>
          <h1 className="display-2 fw-bold mb-2">{stateName}</h1>
          <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
            <span className="badge rounded-pill bg-white text-dark px-3 py-2 fw-bold shadow-sm">
              {data.routeCount}
            </span>
            <span className="badge rounded-pill bg-primary px-3 py-2 fw-bold shadow-sm">
              <Star size={14} className="me-1" /> {data.heritage}
            </span>
          </div>
          <p className="lead opacity-90 fw-semibold">Experience the timeless heritage and vibrant culture of {stateName}</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-50px' }}>
        {/* Search Mockup - now functional with selects */}
        <div className="card border-0 shadow-lg rounded-4 p-4 mb-5">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="smallest fw-bold text-secondary uppercase mb-2">FROM CITY</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><MapPin size={18} className="text-primary" /></span>
                <select 
                  className="form-select bg-light border-0 fw-semibold" 
                  value={search.from}
                  onChange={e => setSearch({...search, from: e.target.value})}
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <label className="smallest fw-bold text-secondary uppercase mb-2">TO CITY</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><MapPin size={18} className="text-primary" /></span>
                <select 
                  className="form-select bg-light border-0 fw-semibold" 
                  value={search.to}
                  onChange={e => setSearch({...search, to: e.target.value})}
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <label className="smallest fw-bold text-secondary uppercase mb-2">DATE</label>
              <input 
                type="date" 
                className="form-control bg-light border-0 fw-semibold" 
                value={search.date}
                onChange={e => setSearch({...search, date: e.target.value})}
              />
            </div>
            <div className="col-md-1">
              <button className="btn btn-primary w-100 p-2 rounded-3" onClick={() => handleBookNow({ from: search.from, to: search.to, price: 599 })}>
                <Search size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Booking Section Overlay */}
        {activeTrip && (
          <div className="mb-5 animate-fade">
            <BookingSection 
              trip={activeTrip} 
              onClose={() => setActiveTrip(null)}
              onConfirm={() => {
                setActiveTrip(null)
                window.dispatchEvent(new Event('storage'))
              }}
            />
          </div>
        )}

        {/* Recommended Routes */}
        <div className="row">
          <div className="col-lg-8">
            <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Bus className="text-primary" />
              Top Recommended Routes in {stateName}
            </h4>
            
            <div className="d-grid gap-3">
              {data.cities.map((route, idx) => (
                <div key={idx} className="card border-0 shadow-sm rounded-4 p-3 hover-up overflow-hidden">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-4">
                      <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                        <Bus size={24} />
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <div className="text-center">
                          <div className="fw-bold fs-5 text-slate-800">{route.from}</div>
                          <div className="smallest text-secondary fw-bold">SOURCE</div>
                        </div>
                        <div className="d-flex flex-column align-items-center px-2">
                          <div className="text-primary opacity-50 mb-n1"><Star size={12} fill="currentColor" /></div>
                          <div style={{ width: '40px', height: '2px', background: 'linear-gradient(to right, transparent, #D84E55, transparent)' }}></div>
                        </div>
                        <div className="text-center">
                          <div className="fw-bold fs-5 text-slate-800">{route.to}</div>
                          <div className="smallest text-secondary fw-bold">DESTINATION</div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-4 ms-auto">
                      <div className="text-end">
                        <div className="text-secondary smallest fw-bold uppercase" style={{ letterSpacing: '1px' }}>Starting From</div>
                        <div className="fw-bold fs-3" style={{ color: '#D84E55' }}>₹{route.price}</div>
                      </div>
                      <button 
                        className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm"
                        style={{ background: `linear-gradient(135deg, #D84E55, #f97316)`, border: 'none' }}
                        onClick={() => handleBookNow(route)}
                      >
                        {user ? 'Book Now' : '🔒 Login to Book'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: '100px' }}>
              <h5 className="fw-bold mb-3">Why travel in {stateName}?</h5>
              <ul className="list-unstyled d-grid gap-3 mb-4">
                <li className="d-flex gap-3">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary flex-shrink-0" style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Star size={20} />
                  </div>
                  <div>
                    <div className="fw-bold small">Heritage Sites</div>
                    <p className="smallest text-secondary mb-0">Visit world-famous landmarks and historical monuments.</p>
                  </div>
                </li>
                <li className="d-flex gap-3">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary flex-shrink-0" style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div className="fw-bold small">Safe Travels</div>
                    <p className="smallest text-secondary mb-0">Top-rated bus operators ensuring your safety 24/7.</p>
                  </div>
                </li>
              </ul>
              
              <div className="bg-light p-3 rounded-4">
                <p className="smallest fw-bold text-secondary mb-1">PROMO CODE</p>
                <div className="d-flex justify-content-between align-items-center">
                  <code className="fs-6 fw-bold text-primary">{stateName.toUpperCase()}20</code>
                  <button className="btn btn-sm btn-dark rounded-pill px-3">Copy</button>
                </div>
                <p className="smallest text-secondary mt-2 mb-0">Get 20% OFF on all routes in {stateName}.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hover-up {
          transition: all 0.3s ease;
        }
        .hover-up:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
        }
        .smallest {
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }
        .uppercase {
          text-transform: uppercase;
        }
      `}</style>
    </div>
  )
}

export default StateDetailView
