
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const PORTS = [5173, 5174, 5175, 5176, 5000, 5001, 3000, 3001, 4000, 4001];

// Helper to get ALL PIDs for a port that are LISTENING
async function getPidsForPort(port) {
    const pids = new Set();
    try {
        const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
        const lines = stdout.trim().split('\n');

        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            // Proto Local Address Foreign Address State PID
            if (parts.length < 5) continue;

            const localAddr = parts[1];
            const state = parts[3];
            const pid = parts[parts.length - 1];

            if (!localAddr.endsWith(`:${port}`)) continue;
            if (state !== 'LISTENING') continue;
            if (pid === '0') continue;

            pids.add(pid);
        }
    } catch (error) {
        // findstr returns exit code 1 if not found
    }
    return Array.from(pids);
}

async function getProcessName(pid) {
    try {
        // tasklist /FI "PID eq 1234" /FO CSV /NH
        const { stdout } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
        // Output: "Image Name","PID","Session Name","Session#","Mem Usage"
        // "node.exe","1234","Console","1","12,345 K"
        const line = stdout.trim();
        if (!line) return null;

        // precise CSV parsing not strictly needed if we just look for patterns, but let's be safe-ish
        // simple split by comma might fail if quotes contain commas, but tasklist output is standard
        const parts = line.split('","');
        if (parts.length > 0) {
            // first part starts with ", strip it
            return parts[0].replace(/^"/, '');
        }
    } catch (error) {
        return null;
    }
    return null;
}

async function killPid(pid) {
    if (!pid || pid === '0') return;

    const procName = await getProcessName(pid);
    const safeName = procName ? procName.toLowerCase() : '';

    // DOCKER SAFETY CHECK
    if (safeName.includes('docker') || safeName.includes('wsl') || safeName.includes('vmmem') || safeName.includes('vpnkit')) {
        console.warn(`WARNING: Port is held by Docker process '${procName}' (PID ${pid}). Skipping kill to avoid crashing Docker.`);
        console.warn(`   -> Action Required: Please stop the container using 'docker stop' or 'docker-compose down' manually.`);
        return;
    }

    try {
        console.log(`Killing PID ${pid} (${procName || 'unknown'})...`);
        await execAsync(`taskkill /F /PID ${pid} /T`);
        console.log(`Successfully killed PID ${pid}`);
    } catch (error) {
        const msg = error.message || '';
        if (msg.includes('not found')) {
            console.log(`PID ${pid} not found (already gone).`);
        } else {
            console.log(`Failed to kill PID ${pid}: ${msg.split('\n')[0]}`);
        }
    }
}

async function cleanup() {
    console.log('Cleaning up development ports...');

    // First pass: Find and kill (safely)
    for (const port of PORTS) {
        const pids = await getPidsForPort(port);
        if (pids.length > 0) {
            console.log(`Port ${port} is in use by PIDs: ${pids.join(', ')}`);
            for (const pid of pids) {
                await killPid(pid);
            }
        }
    }

    // Checking if we cleared enough
    // We don't exit 1 here immediately because maybe the user wants to proceed even if Docker holds ports 
    // (though dev:start will fail, it's better than crashing docker).
}

cleanup().catch(err => {
    console.error('Cleanup script error:', err);
    process.exit(1);
});
