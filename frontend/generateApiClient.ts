import { spawn, exec } from 'child_process';
import path from 'path';
import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd());

const command = path.join(__dirname, 'node_modules', '.bin', 'openapi-generator-cli');
const args = [
    'generate',
    '-i',
    process.env.OPENAPI_URL!,
    '-c',
    'openapiconfig.json',
    '-o',
    path.join(__dirname, 'src', 'apiClient')
]

exec(`${command} ${args.join(' ')}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});

