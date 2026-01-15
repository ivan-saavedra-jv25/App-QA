import React, { useState, useEffect } from 'react';
import { createPlan, updatePlan } from '../api';
import './PlanList.css';

const PlanForm = ({ plan, isVisible, onClose, onPlanCreated }) => {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    description: plan?.description || '',
    testCasesJson: plan?.testCases ? JSON.stringify(plan.testCases.map(tc => ({
      name: tc.name,
      description: tc.description || ''
    })), null, 2) : ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setFormData({
      name: plan?.name || '',
      description: plan?.description || '',
      testCasesJson: plan?.testCases ? JSON.stringify(plan.testCases.map(tc => ({
        name: tc.name,
        description: tc.description || ''
      })), null, 2) : ''
    });
    setError(null);
    setShowAdvanced(false);
  }, [plan, isVisible]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateTestCasesJson = () => {
    if (!formData.testCasesJson.trim()) return [];
    
    try {
      const parsed = JSON.parse(formData.testCasesJson);
      if (!Array.isArray(parsed)) {
        throw new Error('Test cases must be an array');
      }
      return parsed;
    } catch (err) {
      throw new Error('Invalid JSON format: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Plan name is required');
      return;
    }

    let testCases = [];
    if (formData.testCasesJson.trim()) {
      try {
        testCases = validateTestCasesJson();
      } catch (err) {
        setError(err.message);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const planData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        testCases
      };

      let result;
      if (plan) {
        result = await updatePlan(plan.id, planData.name, planData.description);
      } else {
        result = await createPlan(planData.name, planData.description, planData.testCases);
      }

      onPlanCreated(result);
      onClose();
    } catch (err) {
      setError(plan ? 'Error updating plan' : 'Error creating plan');
      console.error('Error saving plan:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {plan ? 'Edit Plan' : 'Create New Plan'}
            </h5>
            <button 
              type="button" 
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Plan Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${error && !formData.name.trim() ? 'is-invalid' : ''}`}
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter plan name"
                  maxLength={150}
                  disabled={loading}
                  autoFocus
                />
                {error && !formData.name.trim() && (
                  <div className="invalid-feedback">
                    Plan name is required
                  </div>
                )}
                <div className="form-text">
                  {formData.name.length}/150 characters
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter plan description (optional)"
                  rows={4}
                  disabled={loading}
                />
                <div className="form-text">
                  Optional: Provide a detailed description of the test plan
                </div>
              </div>

              {/* Advanced Section - Test Cases JSON */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label mb-0">
                    <i className="fas fa-code me-2"></i>
                    Test Cases (JSON)
                    <span className="text-muted ms-2">(Optional)</span>
                  </label>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    {showAdvanced ? 'Hide' : 'Show'} JSON
                  </button>
                </div>
                
                {showAdvanced && (
                  <div className="card border-secondary">
                    <div className="card-body">
                      <textarea
                        className={`form-control font-monospace ${error && error.includes('JSON') ? 'is-invalid' : ''}`}
                        name="testCasesJson"
                        value={formData.testCasesJson}
                        onChange={handleChange}
                        placeholder={`[
                          {
                            "name": "Nombre técnico corto y único",
                            "description": "Descripción exacta de lo que valida el caso",
                            "validation_type": "Tipo de validación",
                            "priority": "P1 | P2 | P3"
                          }
                        ]`}
                        rows={6}
                        disabled={loading}
                        style={{ fontSize: '0.875rem' }}
                      />
                      {error && error.includes('JSON') && (
                        <div className="invalid-feedback">
                          {error}
                        </div>
                      )}
                      <div className="form-text">
                        <strong>Format:</strong> Array of objects with "name" (required) and "description" (optional) fields.
                        <br />
                        <strong>Example:</strong> {`[{"name": "Login test", "description": "Test login functionality"}]`}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">
                    <i className="fas fa-info-circle me-2"></i>
                    About Test Plans
                  </h6>
                  <p className="card-text small text-muted mb-0">
                    Un plan de prueba es una colección de casos de prueba que deben ser ejecutados. Una vez que cree un plan, puede agregar casos de prueba y realizar un seguimiento de su progreso. El estado del plan se actualizará automáticamente en función de la finalización de los casos de prueba.
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn btn-primary"
                disabled={loading || !formData.name.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </span>
                    {plan ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <i className="fas fa-check me-2"></i>
                    {plan ? 'Update Plan' : 'Create Plan'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlanForm;
