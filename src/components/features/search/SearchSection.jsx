import React, { useState, useMemo, useEffect } from 'react'
import { SlidersHorizontal, MapPin, Calendar, Clock, Info, Search as SearchIcon } from 'lucide-react'
import { CITIES, BUS_CATALOG, CITY_STATE_MAP, CITY_POINTS, ROUTE_FARES, COACH_MULTIPLIER } from '../../../constants'
import { toMin, bucketTime, minsToHHMM } from '../../../utils/timeUtils'
import BookingSection from './BookingSection'

function SearchSection({ user, onOpenAuth }) {
  const [searchParams, setSearchParams] = useState({
    from: 'Bengaluru',
    to: 'Chennai',
    date: new Date().toISOString().split('T')[0]
  })

  const [filters, setFilters] = useState({
    operators: new Set(),
    coach: 'ALL',
    time: 'ALL',
    maxPrice: 2500,
    sortBy: 'EARLIEST'
  })

  const [trips, setTrips] = useState([])
  const [activeTrip, setActiveTrip] = useState(null)

  const buildTrips = (from, to, date) => {
    const dur = 360
    const fromState = CITY_STATE_MAP[from]
    const toState = CITY_STATE_MAP[to]
    const boardAll = CITY_POINTS[from]?.boarding || ["Main Stand"]
    const dropAll = CITY_POINTS[to]?.dropping || ["Main Stand"]

    const results = []
    BUS_CATALOG.forEach(bus => {
      if (bus.state && bus.state !== fromState && bus.state !== toState) return

      bus.times.forEach(time => {
        const depMin = toMin(time)
        const arrMin = (depMin + dur) % (24 * 60)

        bus.coachTypes.forEach(coach => {
          const baseFare = ROUTE_FARES[`${from}|${to}`] || ROUTE_FARES[`${to}|${from}`] || 700
          const price = Math.round(baseFare * (COACH_MULTIPLIER[coach] || 1) * (bus.fareMultiplier || 1))

          results.push({
            id: `${bus.name}|${coach}|${time}`,
            bus: bus.name,
            coach,
            date,
            from,
            to,
            depTime: time,
            depMin,
            arrMin,
            duration: dur,
            boardingAll: boardAll,
            droppingAll: dropAll,
            price,
            seatsLeft: Math.max(3, 36 - ((bus.name.length + depMin) % 20)),
            amenities: coach === "Sleeper" ? ["WiFi", "Charging"] : ["AC", "Water"]
          })
        })
      })
    })
    return results
  }

  const handleSearch = (e) => {
    if (e) e.preventDefault()
    if (searchParams.from === searchParams.to) {
      alert("From and To can't be same.")
      return
    }
    setTrips(buildTrips(searchParams.from, searchParams.to, searchParams.date))
    setActiveTrip(null)
  }

  useEffect(() => { handleSearch() }, [])

  const filteredTrips = useMemo(() => {
    let out = [...trips]
    if (filters.operators.size) out = out.filter(t => filters.operators.has(t.bus))
    if (filters.coach !== 'ALL') out = out.filter(t => t.coach === filters.coach)
    if (filters.time !== 'ALL') out = out.filter(t => bucketTime(t.depMin) === filters.time)
    out = out.filter(t => t.price <= filters.maxPrice)

    if (filters.sortBy === 'EARLIEST') out.sort((a, b) => a.depMin - b.depMin)
    if (filters.sortBy === 'CHEAPEST') out.sort((a, b) => a.price - b.price)
    if (filters.sortBy === 'LATEST') out.sort((a, b) => b.depMin - a.depMin)

    return out
  }, [trips, filters])

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4 animate-fade">
        <div className="card-body p-4">
          <form className="row g-3 align-items-end" onSubmit={handleSearch}>
            <div className="col-md-3">
              <label className="form-label small fw-bold text-secondary">FROM</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><MapPin size={18} /></span>
                <select 
                  className="form-select border-0 bg-light fw-semibold"
                  value={searchParams.from}
                  onChange={(e) => setSearchParams({...searchParams, from: e.target.value})}
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold text-secondary">TO</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><MapPin size={18} /></span>
                <select 
                  className="form-select border-0 bg-light fw-semibold"
                  value={searchParams.to}
                  onChange={(e) => setSearchParams({...searchParams, to: e.target.value})}
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold text-secondary">DATE</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><Calendar size={18} /></span>
                <input 
                  type="date" 
                  className="form-control border-0 bg-light fw-semibold" 
                  value={searchParams.date}
                  onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                />
              </div>
            </div>
            <div className="col-md-3">
              <button className="btn btn-primary w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-3 shadow-sm" type="submit">
                <SearchIcon size={20} />
                Search Buses
              </button>
            </div>
          </form>
        </div>
      </div>

      {activeTrip && (
        <BookingSection 
          trip={activeTrip} 
          onClose={() => setActiveTrip(null)} 
          onConfirm={() => {
            setActiveTrip(null)
            window.dispatchEvent(new Event('storage'))
          }} 
        />
      )}

      <div className="row g-4 mt-2">
        <div className="col-lg-3">
          <div className="card shadow-sm border-0 rounded-4 sticky-top" style={{ top: '100px' }}>
            <div className="card-body p-3">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <SlidersHorizontal size={18} /> Filters
                </h6>
                <button 
                  className="btn btn-link btn-sm text-decoration-none p-0 fw-bold"
                  onClick={() => setFilters({ operators: new Set(), coach: 'ALL', time: 'ALL', maxPrice: 2500, sortBy: 'EARLIEST' })}
                >
                  Reset
                </button>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-secondary">COACH TYPE</label>
                <div className="d-flex gap-2 flex-wrap">
                  {['ALL', 'AC', 'Non-AC', 'Sleeper'].map(type => (
                    <button 
                      key={type}
                      className={`btn btn-sm rounded-pill px-3 fw-semibold ${filters.coach === type ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => setFilters({...filters, coach: type})}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-secondary">TIME</label>
                <div className="d-flex gap-2 flex-wrap">
                  {['ALL', 'MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'].map(t => (
                    <button 
                      key={t}
                      className={`btn btn-sm rounded-pill px-3 fw-semibold ${filters.time === t ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => setFilters({...filters, time: t})}
                    >
                      {t.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label small fw-bold text-secondary mb-0">MAX PRICE</label>
                  <span className="fw-bold text-primary">₹{filters.maxPrice}</span>
                </div>
                <input 
                  type="range" 
                  className="form-range" 
                  min="200" max="2500" step="50"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value)})}
                />
              </div>

              <div>
                <label className="form-label small fw-bold text-secondary">OPERATORS</label>
                <div className="overflow-auto" style={{ maxHeight: '200px' }}>
                  {BUS_CATALOG.map(bus => (
                    <div key={bus.name} className="form-check mb-2">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={filters.operators.has(bus.name)}
                        onChange={(e) => {
                          const newOps = new Set(filters.operators)
                          if (e.target.checked) newOps.add(bus.name)
                          else newOps.delete(bus.name)
                          setFilters({...filters, operators: newOps})
                        }}
                      />
                      <label className="form-check-label small fw-semibold">{bus.name}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Available Buses <span className="text-secondary small">({filteredTrips.length})</span></h5>
            <div className="d-flex align-items-center gap-2">
              <span className="small text-secondary fw-semibold">Sort by:</span>
              <select 
                className="form-select form-select-sm border-0 bg-transparent fw-bold"
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              >
                <option value="EARLIEST">Earliest</option>
                <option value="CHEAPEST">Cheapest</option>
                <option value="LATEST">Latest</option>
              </select>
            </div>
          </div>

          <div className="d-grid gap-3">
            {filteredTrips.map(trip => (
              <div key={trip.id} className="card shadow-sm border-0 rounded-4 overflow-hidden animate-fade">
                <div className="card-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8 border-end">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h5 className="fw-bold text-primary mb-1">{trip.bus}</h5>
                          <span className="badge bg-light text-secondary rounded-pill fw-semibold">{trip.coach}</span>
                        </div>
                        <div className="text-end">
                          <h4 className="fw-bold mb-0">₹{trip.price}</h4>
                          <small className="text-secondary fw-semibold">per seat</small>
                        </div>
                      </div>

                      <div className="d-flex align-items-center justify-content-between text-center py-2 bg-light rounded-4 px-4">
                        <div>
                          <div className="fw-bold fs-5">{trip.depTime}</div>
                          <div className="small text-secondary fw-semibold">{trip.from}</div>
                        </div>
                        <div className="flex-grow-1 px-3">
                          <div className="border-bottom border-2 border-primary position-relative" style={{ height: '10px' }}>
                            <Clock size={16} className="position-absolute start-50 top-0 translate-middle bg-light px-1 text-primary" />
                          </div>
                          <div className="small text-secondary fw-bold mt-1">{Math.floor(trip.duration/60)}h {trip.duration%60}m</div>
                        </div>
                        <div>
                          <div className="fw-bold fs-5">{minsToHHMM(trip.arrMin)}</div>
                          <div className="small text-secondary fw-semibold">{trip.to}</div>
                        </div>
                      </div>

                      <div className="mt-3 d-flex gap-2 flex-wrap">
                        {trip.amenities.map(a => (
                          <span key={a} className="small bg-white border rounded-pill px-3 py-1 text-secondary fw-semibold d-flex align-items-center gap-1">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="col-md-4 d-flex flex-column justify-content-between text-center py-2">
                      <div>
                        <div className="text-success fw-bold small mb-1">{trip.seatsLeft} Seats Available</div>
                        <div className="text-secondary small mb-3">Safe & Secure Travel</div>
                      </div>
                      <div className="d-grid gap-2">
                        <button
                          className="btn btn-primary fw-bold rounded-3"
                          onClick={() => {
                            if (!user) {
                              onOpenAuth('#loginModal')
                            } else {
                              setActiveTrip(trip)
                            }
                          }}
                        >
                          {user ? 'Select Seats' : '🔒 Login to Book'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredTrips.length === 0 && (
              <div className="text-center py-5">
                <Info size={48} className="text-secondary mb-3 opacity-25" />
                <h5 className="text-secondary fw-bold">No buses found matching your filters</h5>
                <p className="text-secondary small">Try adjusting your filters or search criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchSection
