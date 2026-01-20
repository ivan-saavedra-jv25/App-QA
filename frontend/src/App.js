import React from 'react';
import PlanList from './components/PlanList';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="min-vh-100 bg-light" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', paddingTop: '1rem' }}>
      <PlanList />
    </div>
  );
}

export default App;
