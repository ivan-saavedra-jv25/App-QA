import { useState } from "react";
import { createPlan } from "../api";

const CreatePlanModal = ({ isOpen, onClose, onPlanCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [jsonText, setJsonText] = useState("");

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    
    try {
      const tests = JSON.parse(jsonText);
      await createPlan(name, description, tests);
      setName("");
      setDescription("");
      setJsonText("");
      onPlanCreated();
      onClose();
      alert("Plan creado exitosamente");
    } catch (error) {
      console.error("Error creating plan:", error);
      alert("Error al crear el plan. Verifica que el JSON sea válido.");
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-primary)', 
        borderRadius: 'var(--border-radius-lg)', 
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
      }}>
        <form onSubmit={handleCreatePlan} className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0" style={{ color: 'var(--text-primary)' }}>
              <i className="fas fa-plus-circle me-2" style={{ color: 'var(--primary)' }}></i>
              Crear Plan de Pruebas
            </h4>
            <button 
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.5rem',
                lineHeight: 1
              }}
            >
              &times;
            </button>
          </div>
          
          <div className="mb-4">
            <label className="form-label mb-2" style={{
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}>
              Nombre del plan
            </label>
            <input 
              className="form-control"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--border-radius)',
                fontSize: '1.05rem'
              }}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Pruebas de Integración"
            />
          </div>

          <div className="mb-4">
            <label className="form-label mb-2" style={{
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}>
              Descripción
            </label>
            <input 
              className="form-control"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '0.6rem 1rem',
                borderRadius: 'var(--border-radius)'
              }}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Breve descripción del plan"
            />
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label mb-0" style={{
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: '500'
              }}>
                JSON de pruebas
              </label>
              <button 
                className="btn btn-sm"
                style={{
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem'
                }}
                onClick={() => setJsonText(JSON.stringify([{title:"Prueba 1", description:"Descripción..."}], null, 2))}
              >
                <i className="fas fa-magic me-1"></i>Ejemplo
              </button>
            </div>
            <textarea 
              className="form-control font-monospace" 
              rows="6"
              style={{ 
                fontSize: '0.9rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--border-radius)',
                padding: '0.8rem 1rem',
                lineHeight: '1.5'
              }}
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
              placeholder='[{"title":"Prueba 1","description":"Descripción..."}]'
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button 
              type="button"
              className="btn px-4 py-2"
              onClick={onClose}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="btn px-4 py-2"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="fas fa-plus-circle"></i>
              Crear Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlanModal;
