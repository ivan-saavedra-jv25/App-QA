const fs = require('fs');
const path = require('path');

// Generar nombre de archivo con fecha actual
const getLogFileName = () => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(__dirname, '../logs', `requests-${today}.log`);
};

// Asegurar que el directorio de logs exista
const logsDir = path.dirname(getLogFileName());
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = {
  log: (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    
    console.log(logEntry);
    
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
    
    // Escribir al archivo del día actual
    let fileContent = `[${timestamp}] ${message}\n`;
    if (data) {
      fileContent += `${JSON.stringify(data, null, 2)}\n`;
    }
    fileContent += '----------------------------------------\n';
    
    const currentLogFile = getLogFileName();
    fs.appendFileSync(currentLogFile, fileContent);
  },
  
  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ERROR: ${message}`;
    
    console.error(logEntry);
    
    if (error) {
      console.error(error);
    }
    
    // Escribir al archivo del día actual
    let fileContent = `[${timestamp}] ERROR: ${message}\n`;
    if (error) {
      fileContent += `${error.stack || error}\n`;
    }
    fileContent += '----------------------------------------\n';
    
    const currentLogFile = getLogFileName();
    fs.appendFileSync(currentLogFile, fileContent);
  }
};

module.exports = logger;
