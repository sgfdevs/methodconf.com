import { exec } from 'child_process';
import path from 'path';
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

const command = path.join(
    __dirname,
    'node_modules',
    '.bin',
    'openapi-generator-cli',
);

const baseUrl = new URL(process.env.CMS_BASE_URL ?? '');
const swaggerUrl = new URL(
    '/umbraco/swagger/delivery/swagger.json?urls.primaryName=Umbraco%20Delivery%20API',
    baseUrl,
);

const args = [
    'generate',
    '-i',
    swaggerUrl.toString(),
    '-c',
    'openapiconfig.json',
    '-o',
    path.join(__dirname, 'src', 'apiClient'),
];

exec(`${command} ${args.join(' ')}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});
