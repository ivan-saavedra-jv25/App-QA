import React, { useState, useEffect } from 'react';
import CircularProgress from './CircularProgress';
import { 
  getPlan, 
  getTestCasesByPlan, 
  createTestCase, 
  updateTestCaseStatus, 
  deleteTestCase 
} from '../api';
import './PlanView.css';

const PlanView = ({ plan, onBack, onPlanUpdate }) => {
  const [currentPlan, setCurrentPlan] = useState(plan);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // Nuevo estado para el filtro
  const [newTestCase, setNewTestCase] = useState({ 
    name: '', 
    description: '', 
    validationType: '', 
    priority: 'P2' 
  });
  const [addingTestCase, setAddingTestCase] = useState(false);
  const [collapsedTestCases, setCollapsedTestCases] = useState(new Set());
  const [selectedTestCase, setSelectedTestCase] = useState(null);

  useEffect(() => {
    loadPlanData();
  }, [plan.id]);

  const loadPlanData = async () => {
    try {
      setLoading(true);
      const [planData, testCasesData] = await Promise.all([
        getPlan(plan.id),
        getTestCasesByPlan(plan.id)
      ]);
      
      setCurrentPlan(planData);
      setTestCases(testCasesData);
      setError(null);
    } catch (err) {
      setError('Error loading plan data');
      console.error('Error loading plan data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (testCaseId, newStatus) => {
    try {
      await updateTestCaseStatus(testCaseId, newStatus);
      
      // Update local state
      setTestCases(testCases.map(tc => 
        tc.id === testCaseId ? { ...tc, status: newStatus } : tc
      ));

      // Clear selection when status changes
      setSelectedTestCase(null);

      // Recalculate progress
      const updatedTestCases = testCases.map(tc => 
        tc.id === testCaseId ? { ...tc, status: newStatus } : tc
      );
      const progress = calculateProgress(updatedTestCases);
      
      // Update plan status if needed
      if (progress === 100 && currentPlan.status !== 'COMPLETED') {
        const updatedPlan = { ...currentPlan, status: 'COMPLETED', progress: 100 };
        setCurrentPlan(updatedPlan);
        onPlanUpdate(updatedPlan);
      } else if (progress > 0 && currentPlan.status === 'PENDING') {
        const updatedPlan = { ...currentPlan, status: 'IN_PROGRESS', progress };
        setCurrentPlan(updatedPlan);
        onPlanUpdate(updatedPlan);
      } else {
        const updatedPlan = { ...currentPlan, progress };
        setCurrentPlan(updatedPlan);
        onPlanUpdate(updatedPlan);
      }
    } catch (err) {
      setError('Error updating test case status');
      console.error('Error updating test case status:', err);
    }
  };

  const handleDeleteTestCase = async (testCaseId) => {
    if (!window.confirm('Are you sure you want to delete this test case?')) {
      return;
    }

    try {
      await deleteTestCase(testCaseId);
      setTestCases(testCases.filter(tc => tc.id !== testCaseId));
      
      // Recalculate progress
      const updatedTestCases = testCases.filter(tc => tc.id !== testCaseId);
      const progress = calculateProgress(updatedTestCases);
      const updatedPlan = { ...currentPlan, progress, totalCases: updatedTestCases.length };
      setCurrentPlan(updatedPlan);
      onPlanUpdate(updatedPlan);
    } catch (err) {
      setError('Error deleting test case');
      console.error('Error deleting test case:', err);
    }
  };

  const handleAddTestCase = async (e) => {
    e.preventDefault();
    
    if (!newTestCase.name.trim()) {
      setError('Test case name is required');
      return;
    }

    try {
      setAddingTestCase(true);
      setError(null);

      const testCase = await createTestCase(
        plan.id,
        newTestCase.name.trim(),
        newTestCase.description.trim() || null,
        newTestCase.validationType.trim() || null,
        newTestCase.priority
      );

      setTestCases([...testCases, testCase]);
      setNewTestCase({ 
        name: '', 
        description: '', 
        validationType: '', 
        priority: 'P2' 
      });
      setShowAddForm(false);

      // Update plan status and progress
      const updatedTestCases = [...testCases, testCase];
      const progress = calculateProgress(updatedTestCases);
      const updatedPlan = { 
        ...currentPlan, 
        status: progress > 0 ? 'IN_PROGRESS' : 'PENDING',
        progress,
        totalCases: updatedTestCases.length
      };
      setCurrentPlan(updatedPlan);
      onPlanUpdate(updatedPlan);
    } catch (err) {
      setError('Error creating test case');
      console.error('Error creating test case:', err);
    } finally {
      setAddingTestCase(false);
    }
  };

  const calculateProgress = (testCaseList) => {
    if (testCaseList.length === 0) return 0;
    const passed = testCaseList.filter(tc => tc.status === 'PASSED').length;
    return Math.round((passed / testCaseList.length) * 100);
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

  const getTestCaseStatusClass = (status) => {
    switch (status) {
      case 'PASSED':
        return 'bg-success';
      case 'FAILED':
        return 'bg-danger';
      case 'NA':
        return 'bg-secondary';
      case 'PENDING':
        return 'bg-warning';
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

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'P1':
        return 'bg-danger';
      case 'P2':
        return 'bg-warning';
      case 'P3':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const getTypeClass = (type) => {
    if (!type) return 'bg-secondary';
    return 'bg-primary';
  };

  const toggleTestCaseCollapse = (testCaseId) => {
    setCollapsedTestCases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testCaseId)) {
        newSet.delete(testCaseId);
      } else {
        newSet.add(testCaseId);
      }
      return newSet;
    });
  };

  const handleTestCaseClick = (testCaseId) => {
    setSelectedTestCase(prev => prev === testCaseId ? null : testCaseId);
  };

  // Función para filtrar test cases por estado
  const getFilteredTestCases = () => {
    if (statusFilter === 'all') {
      return testCases;
    }
    return testCases.filter(testCase => testCase.status === statusFilter);
  };

  // Función para obtener el conteo de test cases por estado
  const getTestCaseCount = (status) => {
    if (status === 'all') {
      return testCases.length;
    }
    return testCases.filter(testCase => testCase.status === status).length;
  };

  if (loading) {
    return (
      <div className="container py-4" style={{ maxWidth: '1200px' }}>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container plan-view-container py-4" style={{ maxWidth: '1200px' }}>
      
      {/* Header Section - Responsive */}
      <div className="card progress-section mb-4">
        <div className="card-body">
          <div className="row align-items-center g-4">
            
            {/* Plan Header - Mobile First */}
            <div className="col-12 col-lg-7">
              <div className="plan-view-header">
                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3 mb-3">
                  <button 
                    className="btn btn-outline-secondary btn-responsive font-hack"
                    onClick={onBack}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    <span className="btn-text">Back</span>
                  </button>
                  <div className="flex-grow-1">
                    <h1 className="h3 h2-sm mb-2 font-hack">{currentPlan.name}</h1>
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <span className={`badge ${getStatusBadgeClass(currentPlan.status)} badge-responsive font-hack`}>
                        {currentPlan.status}
                      </span>
                      <span className="text-muted small font-hack">
                        <i className="fas fa-clipboard-list me-1"></i>
                        {testCases.length} cases
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Stats Row */}
                <div className="row g-3 mb-3">
                  <div className="col-6 col-md-3">
                    <div className="stat-card">
                      <div className="stat-number font-hack">{testCases.length}</div>
                      <div className="stat-label">Total</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="stat-card">
                      <div className="stat-number text-success font-hack">
                        {testCases.filter(tc => tc.status === 'PASSED').length}
                      </div>
                      <div className="stat-label">Passed</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="stat-card">
                      <div className="stat-number text-warning font-hack">
                        {testCases.filter(tc => tc.status === 'PENDING').length}
                      </div>
                      <div className="stat-label">Pending</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="stat-card">
                      <div className="stat-number text-danger font-hack">
                        {testCases.filter(tc => tc.status === 'FAILED').length}
                      </div>
                      <div className="stat-label">Failed</div>
                    </div>
                  </div>
                </div>
                
                {currentPlan.description && (
                  <p className="text-muted mb-0 description-text font-hack">{currentPlan.description}</p>
                )}
              </div>
            </div>
            
            {/* Progress Circle - Responsive */}
            <div className="col-12 col-lg-5 text-center">
              <div className="circular-progress-wrapper">
                <CircularProgress 
                  percentage={currentPlan.progress} 
                  size={window.innerWidth < 768 ? 120 : 150}
                  strokeWidth={window.innerWidth < 768 ? 8 : 12}
                />
                <div className="progress-label mt-2">
                  <span className="h5 mb-0 font-hack">{currentPlan.progress}%</span>
                  <div className="text-muted small font-hack">Complete</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button 
            type="button" 
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* Test Cases Section - Responsive */}
      <div className="card test-cases-section">
        <div className="card-header test-cases-header">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3">
              <h5 className="mb-0 font-hack">
                <i className="fas fa-clipboard-list me-2"></i>
                Test Cases
              </h5>
              <div className="filter-section">
                <label htmlFor="statusFilter" className="form-label me-2 mb-0 small font-hack">
                  Filter:
                </label>
                <select
                  id="statusFilter"
                  className="form-select form-select-sm font-hack"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ minWidth: '120px' }}
                >
                  <option value="all">
                    All ({getTestCaseCount('all')})
                  </option>
                  <option value="PASSED">
                    Passed ({getTestCaseCount('PASSED')})
                  </option>
                  <option value="PENDING">
                    Pending ({getTestCaseCount('PENDING')})
                  </option>
                  <option value="FAILED">
                    Failed ({getTestCaseCount('FAILED')})
                  </option>
                  <option value="NA">
                    N/A ({getTestCaseCount('NA')})
                  </option>
                </select>
              </div>
            </div>
            <button 
              className="btn btn-primary btn-responsive btn-add-test-case font-hack"
              onClick={() => setShowAddForm(true)}
            >
              <i className="fas fa-plus me-2"></i>
              <span className="btn-text">Add Test Case</span>
            </button>
          </div>
        </div>
        <div className="card-body">
          {getFilteredTestCases().length === 0 ? (
            <div className="text-center py-5 empty-state">
              <div className="empty-state-content">
                <i className="fas fa-filter display-4 text-muted mb-3"></i>
                <h6 className="text-muted mb-2 font-hack">
                  {statusFilter === 'all' ? 'No test cases yet' : `No ${statusFilter.toLowerCase()} test cases`}
                </h6>
                <p className="text-muted mb-4 font-hack">
                  {statusFilter === 'all' 
                    ? 'Add your first test case to get started' 
                    : `No test cases found with status "${statusFilter}"`
                  }
                </p>
                {statusFilter === 'all' && (
                  <button 
                    className="btn btn-primary btn-responsive font-hack"
                    onClick={() => setShowAddForm(true)}
                  >
                    <i className="fas fa-plus me-2"></i>
                    <span className="btn-text">Add Test Case</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="test-cases-list">
              {getFilteredTestCases().map(testCase => {
                const isCollapsed = testCase.status === 'PASSED' && !collapsedTestCases.has(testCase.id);
                const isSelected = selectedTestCase === testCase.id;
                
                return (
                  <div 
                    key={testCase.id} 
                    className={`test-case-item ${isSelected ? 'selected' : ''} ${isCollapsed ? 'collapsed' : ''}`}
                    onClick={() => handleTestCaseClick(testCase.id)}
                  >
                    <div className="test-case-content">
                      {/* Test Case Header */}
                      <div className="test-case-header">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <h6 className="mb-0 test-case-title font-hack">{testCase.name}</h6>
                              {testCase.status === 'PASSED' && (
                                <button 
                                  className="expand-collapse-btn btn btn-outline-secondary btn-sm py-0 px-2 font-hack"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTestCaseCollapse(testCase.id);
                                  }}
                                  title={isCollapsed ? "Expand" : "Collapse"}
                                >
                                  <i className={`fas fa-chevron-${isCollapsed ? 'down' : 'up'}`}></i>
                                </button>
                              )}
                            </div>
                            
                            {/* Status Badge */}
                            <div className="mb-2">
                              <span className={`badge ${getTestCaseStatusClass(testCase.status)} badge-responsive font-hack`}>
                                <i className={`fas ${
                                  testCase.status === 'PASSED' ? 'fa-check-circle' :
                                  testCase.status === 'FAILED' ? 'fa-times-circle' :
                                  'fa-clock'
                                } me-1`}></i>
                                {testCase.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Test Case Details - Collapsible */}
                      <div className="test-case-details">
                        {!isCollapsed && (
                          <>
                            {testCase.description && (
                              <p className="text-muted small mb-3 description-text font-hack">
                                {testCase.description}
                              </p>
                            )}
                            
                            {/* Tags */}
                            <div className="d-flex flex-wrap gap-2 mb-3">
                              {testCase.validation_type && (
                                <span className={`badge ${getTypeClass(testCase.validation_type)} small font-hack`}>
                                  <i className="fas fa-tag me-1"></i>
                                  {testCase.validation_type}
                                </span>
                              )}
                              <span className={`badge ${getPriorityClass(testCase.priority)} small font-hack`}>
                                <i className={`fas ${
                                  testCase.priority === 'P1' ? 'fa-exclamation-triangle' :
                                  testCase.priority === 'P2' ? 'fa-info-circle' :
                                  'fa-arrow-down'
                                } me-1`}></i>
                                {testCase.priority}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="test-case-actions">
                              <div className="action-buttons-grid">
                                <button 
                                  className="btn btn-success btn-action font-hack"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(testCase.id, 'PASSED');
                                  }}
                                  title="Mark as Passed"
                                  disabled={testCase.status === 'PASSED'}
                                >
                                  <i className="fas fa-check"></i>
                                  <span className="btn-text">Passed</span>
                                </button>
                                <button 
                                  className="btn btn-danger btn-action font-hack"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(testCase.id, 'FAILED');
                                  }}
                                  title="Mark as Failed"
                                  disabled={testCase.status === 'FAILED'}
                                >
                                  <i className="fas fa-times"></i>
                                  <span className="btn-text">Failed</span>
                                </button>
                                <button 
                                  className="btn btn-warning btn-action font-hack"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(testCase.id, 'PENDING');
                                  }}
                                  title="Reset to Pending"
                                  disabled={testCase.status === 'PENDING'}
                                >
                                  <i className="fas fa-undo"></i>
                                  <span className="btn-text">Pending</span>
                                </button>
                                <button 
                                  className="btn btn-outline-danger btn-action font-hack"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTestCase(testCase.id);
                                  }}
                                  title="Delete test case"
                                >
                                  <i className="fas fa-trash"></i>
                                  <span className="btn-text">Delete</span>
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Test Case Modal - Responsive */}
      {showAddForm && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-responsive">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-plus me-2"></i>
                  Add Test Case
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTestCase({ 
                      name: '', 
                      description: '', 
                      validationType: '', 
                      priority: 'P2' 
                    });
                    setError(null);
                  }}
                ></button>
              </div>
              <form onSubmit={handleAddTestCase}>
                <div className="modal-body">
                  {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                      <button 
                        type="button" 
                        className="btn-close"
                        onClick={() => setError(null)}
                      ></button>
                    </div>
                  )}
                  
                  <div className="row g-3">
                    <div className="col-12">
                      <label htmlFor="testCaseName" className="form-label font-hack">
                        Test Case Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg font-hack ${error && !newTestCase.name.trim() ? 'is-invalid' : ''}`}
                        id="testCaseName"
                        value={newTestCase.name}
                        onChange={(e) => setNewTestCase({ ...newTestCase, name: e.target.value })}
                        placeholder="Enter test case name"
                        maxLength={150}
                        disabled={addingTestCase}
                      />
                      {error && !newTestCase.name.trim() && (
                        <div className="invalid-feedback font-hack">
                          Test case name is required
                        </div>
                      )}
                    </div>
                    
                    <div className="col-12">
                      <label htmlFor="testCaseDescription" className="form-label font-hack">
                        Description
                      </label>
                      <textarea
                        className="form-control hack-textarea font-hack"
                        id="testCaseDescription"
                        value={newTestCase.description}
                        onChange={(e) => setNewTestCase({ ...newTestCase, description: e.target.value })}
                        placeholder="Enter test case description (optional)"
                        rows={3}
                        disabled={addingTestCase}
                      />
                    </div>
                    
                    <div className="col-12 col-md-6">
                      <label htmlFor="testCaseType" className="form-label font-hack">
                        Validation Type
                      </label>
                      <input
                        type="text"
                        className="form-control font-hack"
                        id="testCaseType"
                        value={newTestCase.validationType}
                        onChange={(e) => setNewTestCase({ ...newTestCase, validationType: e.target.value })}
                        placeholder="Enter validation type"
                        maxLength={100}
                        disabled={addingTestCase}
                      />
                    </div>
                    
                    <div className="col-12 col-md-6">
                      <label htmlFor="testCasePriority" className="form-label font-hack">
                        Priority
                      </label>
                      <select
                        className="form-select font-hack"
                        id="testCasePriority"
                        value={newTestCase.priority}
                        onChange={(e) => setNewTestCase({ ...newTestCase, priority: e.target.value })}
                        disabled={addingTestCase}
                      >
                        <option value="P1">P1 - High</option>
                        <option value="P2">P2 - Medium</option>
                        <option value="P3">P3 - Low</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <div className="d-flex flex-column flex-sm-row gap-2 w-100">
                    <button 
                      type="button"
                      className="btn btn-secondary flex-fill flex-sm-grow-0 font-hack"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewTestCase({ 
                          name: '', 
                          description: '', 
                          validationType: '', 
                          priority: 'P2' 
                        });
                        setError(null);
                      }}
                      disabled={addingTestCase}
                    >
                      <i className="fas fa-times me-2"></i>
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="btn btn-primary flex-fill flex-sm-grow-0 font-hack"
                      disabled={addingTestCase || !newTestCase.name.trim()}
                    >
                      {addingTestCase ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </span>
                          Adding...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus me-2"></i>
                          Add Test Case
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanView;
