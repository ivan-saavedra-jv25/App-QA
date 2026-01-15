import React, { useState } from 'react';
import './AIModal.css';

const AIModal = ({ isVisible, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/promt.txt');
      const text = await response.text();
      
      const blob = new Blob([text], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'prompt-qa-instructions.txt';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-robot me-2"></i>
              Asistente QA - Generador de Casos de Prueba
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              <strong>¿Cómo funciona esta herramienta?</strong>
            </div>
            
            <div className="instructions-section">
              <h6><i className="fas fa-list-ol me-2"></i>Instrucciones de Uso</h6>
              <ol>
                <li><strong>Descarga el archivo de instrucciones</strong> usando el botón de abajo</li>
                <li><strong>Copia el contenido del archivo</strong> y pégalo en tu chat de IA preferido (ChatGPT, Claude, etc.)</li>
                <li><strong>Describe tu funcionalidad</strong> a la IA después de las instrucciones</li>
                <li><strong>Recibe los casos de prueba</strong> en formato JSON listo para usar</li>
              </ol>
            </div>

            <div className="example-section mt-4">
              <h6><i className="fas fa-code me-2"></i>Ejemplo de Uso</h6>
              <div className="bg-light p-3 rounded">
                <p className="mb-2"><strong>Tú:</strong> [Pegas las instrucciones del archivo]</p>
                <p className="mb-2"><strong>Tú:</strong> "Tengo un formulario de login que acepta email y contraseña, debe validar formato de email, mínimo 8 caracteres en contraseña, y bloquear después de 3 intentos fallidos."</p>
                <p className="mb-0"><strong>IA:</strong> [Devuelve el JSON con casos de prueba]</p>
              </div>
            </div>

            <div className="features-section mt-4">
              <h6><i className="fas fa-star me-2"></i>Características del Prompt</h6>
              <ul>
                <li>Detecta funcionalidades explícitas e implícitas</li>
                <li>Genera casos positivos y negativos</li>
                <li>Incluye validaciones de seguridad y formato</li>
                <li>Respuesta estrictamente en JSON</li>
                <li>Optimizado para ingenieros QA</li>
              </ul>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <i className="fas fa-times me-2"></i>
              Cerrar
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <i className={`fas ${isDownloading ? 'fa-spinner fa-spin' : 'fa-download'} me-2`}></i>
              {isDownloading ? 'Descargando...' : 'Descargar Instrucciones'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIModal;
