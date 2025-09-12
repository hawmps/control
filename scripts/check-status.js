#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const isWindows = process.platform === 'win32';

async function checkProcesses() {
  console.log('Checking server status...\n');

  const processes = [
    { name: 'Concurrently process', pattern: isWindows ? 'concurrently' : 'concurrently' },
    { name: 'Backend server (tsx)', pattern: isWindows ? 'tsx server.js' : 'tsx server.js' },
    { name: 'Frontend server (vite)', pattern: isWindows ? 'vite' : 'vite' }
  ];

  for (const proc of processes) {
    try {
      const command = isWindows 
        ? `tasklist /FI "IMAGENAME eq node.exe" /FO CSV | findstr "${proc.pattern}"`
        : `pgrep -f "${proc.pattern}"`;
      
      const { stdout } = await execAsync(command);
      const isRunning = stdout.trim().length > 0;
      
      console.log(`${isRunning ? '✅' : '❌'} ${proc.name}: ${isRunning ? 'RUNNING' : 'STOPPED'}`);
    } catch (error) {
      console.log(`❌ ${proc.name}: STOPPED`);
    }
  }
}

async function checkPorts() {
  console.log('\n');

  const ports = [
    { name: 'Backend API (port 3001)', url: 'http://localhost:3001/api/matrix' },
    { name: 'Frontend (port 5173)', url: 'http://localhost:5173' }
  ];

  for (const port of ports) {
    try {
      const response = await fetch(port.url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(2000)
      });
      
      const isResponding = response.ok || response.status < 500;
      console.log(`${isResponding ? '✅' : '❌'} ${port.name}: ${isResponding ? 'RESPONDING' : 'NOT RESPONDING'}`);
    } catch (error) {
      console.log(`❌ ${port.name}: NOT RESPONDING`);
    }
  }
}

async function main() {
  try {
    await checkProcesses();
    await checkPorts();
  } catch (error) {
    console.error('Error checking status:', error.message);
  }
}

main();