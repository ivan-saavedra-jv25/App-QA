const API = process.env.REACT_APP_API_URL || "http://localhost:4000"
//const API = "http://192.168.1.8:4000"

// Plans
export async function listPlans(){
  const res = await fetch(`${API}/api/plans`)
  return res.json()
}

export async function getPlan(id){
  const res = await fetch(`${API}/api/plans/${id}`)
  return res.json()
}

export async function createPlan(name, description, testCases = []){
  const res = await fetch(`${API}/api/plans`,{
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description, testCases })
  })
  return res.json()
}

export async function updatePlan(id, name, description){
  const res = await fetch(`${API}/api/plans/${id}`,{
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description })
  })
  return res.json()
}

export async function deletePlan(id){
  await fetch(`${API}/api/plans/${id}`,{
    method: "DELETE"
  })
}

// Test Cases
export async function getTestCasesByPlan(planId){
  const res = await fetch(`${API}/api/test-cases/plan/${planId}`)
  return res.json()
}

export async function getTestCase(id){
  const res = await fetch(`${API}/api/test-cases/${id}`)
  return res.json()
}

export async function createTestCase(planId, name, description, validationType, priority){
  const res = await fetch(`${API}/api/test-cases/plan/${planId}`,{
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description, validationType, priority })
  })
  return res.json()
}

export async function updateTestCase(id, name, description, validationType, priority, status){
  const res = await fetch(`${API}/api/test-cases/${id}`,{
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description, validationType, priority, status })
  })
  return res.json()
}

export async function updateTestCaseStatus(id, status){
  const res = await fetch(`${API}/api/test-cases/${id}/status`,{
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  })
  return res.json()
}

export async function deleteTestCase(id){
  await fetch(`${API}/api/test-cases/${id}`,{
    method: "DELETE"
  })
}

export async function getPlanStats(planId){
  const res = await fetch(`${API}/api/test-cases/plan/${planId}/stats`)
  return res.json()
}

export async function cleanupDatabase(){
  const res = await fetch(`${API}/api/cleanup`,{
    method: "DELETE"
  })
  return res.json()
}

// AI Assistant - Export prompt
export async function exportPrompt(){
  const res = await fetch(`${API}/api/test-cases/export-prompt`)
  return res
}

export async function getPromptText(){
  const res = await fetch(`${API}/api/test-cases/export-prompt`)
  return res.text()
}
