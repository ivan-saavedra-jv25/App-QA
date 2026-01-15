import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import "./Run.css"

// Componente legacy - ya no se usa en el nuevo sistema
export default function Run() {
  const { id } = useParams()
  const [tests, setTests] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    // Legacy code - este componente ya no se usa
    // getRun(id)
    // .then(setTests)
    // .catch(console.error)
  }, [id])

  const update = async (rid, status) => {
    // Legacy code - ya no se usa
    // await updateResult(rid, status)
    // setTests(tests.map(t => t.id === rid ? { ...t, status } : t))
  }

  console.log(tests)
  const total = tests.length
  const passed = tests.filter(t=>t.status==="PASS").length
  const percent = total ? Math.round((passed/total)*100) : 0

  



return (
  <div className="container py-4">
    <button 
        onClick={() => navigate('/')} 
        className="btn btn-link mb-3 p-0 d-flex align-items-center"
        style={{
          color: 'var(--text-muted)',
          textDecoration: 'none'
        }}
      >
        <i className="fas fa-arrow-left me-2"></i>
        Volver a Inicio
      </button>
    {/* HEADER */}
    <div className="card shadow-sm mb-4" style={{ 
      backgroundColor: 'var(--bg-primary)',
      borderRadius: 'var(--border-radius-lg)'
    }}>
      <div className="card-body p-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-4">
          <div className="d-flex align-items-center flex-wrap gap-4">
            <div className="d-flex align-items-center">
              <div className="p-3 rounded-circle me-3" style={{
                background: 'var(--primary-soft)'
              }}>
                <i className="fas fa-tasks" style={{
                  color: 'var(--primary)',
                  fontSize: '1.5rem'
                }}></i>
              </div>
              <div>
                <h1 className="h5 mb-1" style={{ color: 'var(--text-primary)' }}>Ejecución #{id}</h1>
                <p className="mb-0" style={{ color: 'var(--text-muted)' }}>{tests.length} pruebas en total</p>
              </div>
            </div>
            
            <div className="d-flex flex-column">
              <span className="small" style={{ color: 'var(--success)' }}>Pasados: {passed}</span>
              <span className="small" style={{ color: 'var(--danger)' }}>Rechazados: {tests.length - passed}</span>
            </div>
          </div>

          {/* Progress Circle */}
          <div className="progress-card">
            <div className="progress-circle" style={{
              width: '80px',
              height: '80px',
              position: 'relative'
            }}>
              <svg viewBox="0 0 36 36" style={{
                width: '100%',
                height: '100%',
                transform: 'rotate(-90deg)'
              }}>
                <path 
                  className="bg" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  style={{
                    fill: 'none',
                    stroke: 'var(--gray-200)',
                    strokeWidth: '3.5'
                  }}
                />
                <path 
                  className="progress"
                  strokeDasharray={`${percent},100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  style={{
                    fill: 'none',
                    stroke: 'var(--primary)',
                    strokeWidth: '3.5',
                    strokeLinecap: 'round',
                    transition: 'stroke-dasharray 0.5s ease'
                  }}
                />
              </svg>

              {percent < 100 ? (
                <span className="position-absolute top-50 start-50 translate-middle" style={{
                  color: 'var(--primary)',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  {percent}%
                </span>
              ) : (
                <span className="position-absolute top-50 start-50 translate-middle" style={{
                  color: 'var(--success)',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}>
                  ✓
                </span>
              )}
            </div>
            <p className="text-center mt-2 mb-0 small" style={{ color: 'var(--text-secondary)' }}>
              {percent === 100 ? "Plan completado" : `Avance ${percent}%`}
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* TEST LIST */}
    <div className="row g-3">
      {tests.map(t => (
        <div key={t.id} className="col-12">
          <div 
            className="card border-0 shadow-sm"
            style={{
              borderLeft: `4px solid ${
                t.status === 'PASS' ? 'var(--success)' : 
                t.status === 'FAIL' ? 'var(--danger)' : 'var(--gray-300)'
              }`,
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--border-radius)',
              transition: 'all 0.2s ease'
            }}
          >
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div className="me-3">
                  <h5 className="card-title mb-1" style={{ color: 'var(--text-primary)' }}>
                    {t.title}
                  </h5>
                  <p className="card-text small mb-0" style={{ color: 'var(--text-muted)' }}>
                    {t.description}
                  </p>
                </div>
                <span 
                  className="badge rounded-pill px-3 py-2"
                  style={{
                    background: t.status === 'PASS' ? 'var(--success-soft)' : 
                              t.status === 'FAIL' ? 'var(--danger-soft)' : 'var(--gray-100)',
                    color: t.status === 'PASS' ? 'var(--success)' : 
                          t.status === 'FAIL' ? 'var(--danger)' : 'var(--gray-600)',
                    border: '1px solid',
                    borderColor: t.status === 'PASS' ? 'var(--success-soft)' : 
                               t.status === 'FAIL' ? 'var(--danger-soft)' : 'var(--gray-200)',
                    fontWeight: '500',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {t.status || 'PENDING'}
                </span>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3 pt-3" style={{ 
                borderTop: '1px solid var(--border-color)'
              }}>
                <button 
                  onClick={() => update(t.id, "PASS")}
                  className="btn btn-sm px-3"
                  style={{
                    background: t.status === 'PASS' ? 'var(--success)' : 'var(--success-soft)',
                    color: t.status === 'PASS' ? 'white' : 'var(--success)',
                    border: `1px solid ${t.status === 'PASS' ? 'var(--success)' : 'var(--success-soft)'}`,
                    borderRadius: 'var(--border-radius)',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '500',
                    fontSize: '0.8rem'
                  }}
                >
                  <i className="fas fa-check"></i>
                  Aprobar
                </button>
                <button 
                  onClick={() => update(t.id, "FAIL")}
                  className="btn btn-sm px-3"
                  style={{
                    background: t.status === 'FAIL' ? 'var(--danger)' : 'var(--danger-soft)',
                    color: t.status === 'FAIL' ? 'white' : 'var(--danger)',
                    border: `1px solid ${t.status === 'FAIL' ? 'var(--danger)' : 'var(--danger-soft)'}`,
                    borderRadius: 'var(--border-radius)',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '500',
                    fontSize: '0.8rem'
                  }}
                >
                  <i className="fas fa-times"></i>
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)
}