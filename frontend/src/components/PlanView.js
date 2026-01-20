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
      

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Progress Section */}
      <div className="card progress-section mb-4">
        <div className="card-body">
          <div className="row align-items-center">

            <div className="col-12 " >
              <div className="plan-view-header d-flex align-items-center ">
                  <button 
                    className="btn btn-outline-secondary me-3"
                    onClick={onBack}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Plans
                  </button>
                  <div className="flex-grow-1">
                    <h1 className="h3 mb-1">{currentPlan.name}</h1>
                    <div className="d-flex align-items-center gap-3">
                      <span className={`badge ${getStatusBadgeClass(currentPlan.status)}`}>
                        {currentPlan.status}
                      </span>
                      <small className="text-muted">
                        {testCases.length} test cases
                      </small>
                    </div>
                  </div>
              </div>
            </div>
            <div className="col-md-8">
              
             
              <div className="d-flex gap-4 mb-2">
                <div>
                  <small className="text-muted">Total Cases:</small>
                  <span className="ms-2 fw-bold">{testCases.length}</span>
                </div>
                <div>
                  <small className="text-muted">Passed:</small>
                  <span className="ms-2 fw-bold">
                    {testCases.filter(tc => tc.status === 'PASSED').length}
                  </span>
                </div>
                <div>
                  <small className="text-muted">Remaining:</small>
                  <span className="ms-2 fw-bold">
                    {testCases.filter(tc => tc.status === 'PENDING').length}
                  </span>
                </div>
              </div>
              {currentPlan.description && (
                <p className="text-muted mb-0">{currentPlan.description}</p>
              )}
            </div>
            <div className="col-md-4 text-center">
              <div className="circular-progress">
                <CircularProgress 
                  percentage={currentPlan.progress} 
                  size={150}
                  strokeWidth={12}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Cases Section */}
      <div className="card test-cases-section">
        <div className="card-header test-cases-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Test Cases</h5>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddForm(true)}
          >
            <i className="fas fa-plus me-2"></i>
            Add Test Case
          </button>
        </div>
        <div className="card-body">
          {testCases.length === 0 ? (
            <div className="text-center py-4 empty-state">
              <div className="text-muted">
                <i className="fas fa-clipboard-times display-4 d-block mb-3"></i>
                <h6>No test cases yet</h6>
                <p>Add your first test case to get started</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddForm(true)}
                >
                  Add Test Case
                </button>
              </div>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {testCases.map(testCase => {
                const isCollapsed = testCase.status === 'PASSED' && !collapsedTestCases.has(testCase.id);
                const isSelected = selectedTestCase === testCase.id;
                
                return (
                  <div 
                    key={testCase.id} 
                    className={`list-group-item ${isSelected ? 'selected' : ''} ${isCollapsed ? 'collapsed' : ''}`}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#e3f2fd' : 'transparent'
                    }}
                    onClick={() => handleTestCaseClick(testCase.id)}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h6 className="mb-0">{testCase.name}</h6>
                          {testCase.status === 'PASSED' && (
                            <button 
                              className="expand-collapse-btn btn btn-outline-secondary btn-sm py-0 px-2"
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
                        <div className="test-case-description">
                          {!isCollapsed && (
                            <>
                              {testCase.description && (
                                <p className="text-muted small mb-2">{testCase.description}</p>
                              )}
                              <div className="d-flex gap-2 mb-2">
                                {testCase.validation_type && (
                                  <span className={`badge ${getTypeClass(testCase.validation_type)} small`}>
                                    {testCase.validation_type}
                                  </span>
                                )}
                                <span className={`badge ${getPriorityClass(testCase.priority)} small`}>
                                  {testCase.priority}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="d-flex gap-2 mb-2">
                          <span className={`badge ${getTestCaseStatusClass(testCase.status)}`}>
                            {testCase.status}
                          </span>
                        </div>
                      </div>
                      <div className="test-case-actions">
                        {!isCollapsed && (
                          <div className="d-flex gap-1">
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(testCase.id, 'PASSED');
                              }}
                              title="Mark as Passed"
                              disabled={testCase.status === 'PASSED'}
                            >
                              <i className="fas fa-check"></i> PASSED
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(testCase.id, 'FAILED');
                              }}
                              title="Mark as Failed"
                              disabled={testCase.status === 'FAILED'}
                            >
                              <i className="fas fa-times"></i> FAILED
                            </button>
                           
                            <button 
                              className="btn btn-warning btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(testCase.id, 'PENDING');
                              }}
                              title="Reset to Pending"
                              disabled={testCase.status === 'PENDING'}
                            >
                              <i className="fas fa-undo"></i> PENDING
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTestCase(testCase.id);
                              }}
                              title="Delete test case"
                            >
                              <i className="fas fa-trash"></i> DELETE
                            </button>
                          </div>
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

      {/* Add Test Case Modal */}
      {showAddForm && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Test Case</h5>
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
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}
                  <div className="mb-3">
                    <label htmlFor="testCaseName" className="form-label">
                      Test Case Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${error && !newTestCase.name.trim() ? 'is-invalid' : ''}`}
                      id="testCaseName"
                      value={newTestCase.name}
                      onChange={(e) => setNewTestCase({ ...newTestCase, name: e.target.value })}
                      placeholder="Enter test case name"
                      maxLength={150}
                      disabled={addingTestCase}
                    />
                    {error && !newTestCase.name.trim() && (
                      <div className="invalid-feedback">
                        Test case name is required
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="testCaseDescription" className="form-label">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id="testCaseDescription"
                      value={newTestCase.description}
                      onChange={(e) => setNewTestCase({ ...newTestCase, description: e.target.value })}
                      placeholder="Enter test case description (optional)"
                      rows={3}
                      disabled={addingTestCase}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="testCaseType" className="form-label">
                      Validation Type
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="testCaseType"
                      value={newTestCase.validationType}
                      onChange={(e) => setNewTestCase({ ...newTestCase, validationType: e.target.value })}
                      placeholder="Enter validation type (optional)"
                      maxLength={100}
                      disabled={addingTestCase}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="testCasePriority" className="form-label">
                      Priority
                    </label>
                    <select
                      className="form-select"
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
                <div className="modal-footer">
                  <button 
                    type="button"
                    className="btn btn-secondary"
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
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
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
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanView;
