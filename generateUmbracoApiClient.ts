import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';
import { loadEnv } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = loadEnv('', process.cwd(), '');

async function main() {
    const baseUrl = new URL(env.UMBRACO_BASE_URL ?? '');

    const schemaConfigs = [
        {
            url: new URL('/umbraco/openapi/delivery.json', baseUrl),
            outputFile: `deliveryApiSchema.d.ts`,
        },
        {
            url: new URL('/umbraco/openapi/default.json', baseUrl),
            outputFile: `defaultApiSchema.d.ts`,
        },
    ];

    await Promise.all(
        schemaConfigs.map(async ({ url, outputFile }) => {
            const outputAst = await openapiTS(url.toString());

            await fs.promises.writeFile(
                path.join(__dirname, 'src', 'data', 'umbraco', outputFile),
                astToString(outputAst),
            );
        }),
    );
}

void main();
