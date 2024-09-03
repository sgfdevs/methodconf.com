import { exec } from 'child_process';
import path from 'path';
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

const command = path.join(
    __dirname,
    'node_modules',
    '.bin',
    'openapi-typescript',
);

const baseUrl = new URL(process.env.CMS_BASE_URL ?? '');
const swaggerUrl = new URL(
    '/umbraco/swagger/delivery/swagger.json?urls.primaryName=Umbraco%20Delivery%20API',
    baseUrl,
);

const args = [
    swaggerUrl.toString(),
    '-o',
    path.join(__dirname, 'src', 'data', 'umbraco', 'schema.d.ts'),
];

exec(`${command} ${args.join(' ')}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});
