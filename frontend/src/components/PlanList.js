import React, { useState, useEffect } from 'react';
import { listPlans, deletePlan, cleanupDatabase } from '../api';
import PlanForm from './PlanForm';
import PlanView from './PlanView';
import AIModal from './AIModal';
import './PlanList.css';

const PlanList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await listPlans();
      setPlans(data);
      setError(null);
    } catch (err) {
      setError('Error loading plans');
      console.error('Error loading plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) {
      return;
    }

    try {
      await deletePlan(planId);
      setPlans(plans.filter(p => p.id !== planId));
    } catch (err) {
      setError('Error deleting plan');
      console.error('Error deleting plan:', err);
    }
  };

  const handlePlanCreated = (newPlan) => {
    setPlans([newPlan, ...plans]);
    setShowCreateForm(false);
  };

  const handlePlanUpdated = (updatedPlan) => {
    setPlans(plans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    setEditingPlan(null);
  };

  const handleCloseModal = () => {
    setShowCreateForm(false);
    setEditingPlan(null);
  };

  const viewDataPromt = (show) => {
    setShowAIModal(show);
  };

  const clearDataBase = async () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      // Implement clear database functionality
      await cleanupDatabase()

      setPlans([]);
      setError('Database cleared successfully');
      setTimeout(() => setError(null), 3000);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-success';
      case 'IN_PROGRESS':
        return 'bg-warning';
      case 'PENDING':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };

  const getProgressClass = (progress) => {
    if (progress === 100) return 'bg-success';
    if (progress >= 50) return 'bg-info';
    if (progress > 0) return 'bg-warning';
    return 'bg-secondary';
  };

  if (selectedPlan) {
    return (
      <PlanView 
        plan={selectedPlan} 
        onBack={() => setSelectedPlan(null)}
        onPlanUpdate={handlePlanUpdated}
      />
    );
  }

  return (
    <div className="container bg-light vh-100" style={{ border: 'solid 1px #0dcaf0', borderRadius: '1%' }}>
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
            Test Plans
          </h1>
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Manage and track your test plans
          </p>
        </div>
        <button 
          className="btn btn-danger"
          onClick={() => clearDataBase()}
        >
          <i className="fas fa-radiation me-2"></i>
          Limpiar Todo
        </button>
        <button 
          className="btn btn-info"
          onClick={() => viewDataPromt(true)}
        >
          <i className="fas fa-robot me-2"></i>
          promt IA
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          <i className="fas fa-plus me-2"></i>
          New Plan
        </button>

      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ 
              width: '4rem', 
              height: '4rem', 
              backgroundColor: 'var(--surface)', 
              borderRadius: 'var(--radius)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.5rem' 
            }}>
              <i className="fas fa-clipboard-list" style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}></i>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              No test plans yet
            </h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              Create your first test plan to start organizing and tracking your test cases
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              <i className="fas fa-plus me-2"></i>
              Create Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="d-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {plans.map(plan => (
            <div key={plan.id} className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h5 className="mb-0" style={{ fontSize: '1rem', fontWeight: '600' }}>{plan.name}</h5>
                  <span className={`badge ${getStatusBadgeClass(plan.status)}`} style={{ fontSize: '0.625rem' }}>
                    {plan.status}
                  </span>
                </div>
                
                {plan.description && (
                  <p className="text-muted mb-3" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                    {plan.description.length > 80 
                      ? `${plan.description.substring(0, 80)}...`
                      : plan.description
                    }
                  </p>
                )}

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Progress</span>
                    <span className="fw-bold" style={{ fontSize: '0.875rem' }}>{plan.progress}%</span>
                  </div>
                  <div className="progress">
                    <div 
                      className={`progress-bar ${getProgressClass(plan.progress)}`}
                      style={{ width: `${plan.progress}%` }}
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between mt-2">
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {plan.completedCases || 0}/{plan.totalCases || 0} cases
                    </span>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-primary btn-sm flex-grow-1"
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <i className="fas fa-eye me-1"></i>
                    View
                  </button>
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setEditingPlan(plan)}
                  >
                    <i className="fas fa-pen"></i>
                  </button>
                  <button 
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Plan Modal */}
      <PlanForm
        isVisible={showCreateForm}
        onClose={handleCloseModal}
        onPlanCreated={handlePlanCreated}
      />

      {/* Edit Plan Modal */}
      <PlanForm
        isVisible={!!editingPlan}
        onClose={handleCloseModal}
        onPlanCreated={handlePlanUpdated}
        plan={editingPlan}
      />

      {/* AI Modal */}
      <AIModal 
        isVisible={showAIModal}
        onClose={() => setShowAIModal(false)}
      />
    </div>
  );
};

export default PlanList;
