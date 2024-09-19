import fs from 'node:fs';
import path from 'path';
import { loadEnvConfig } from '@next/env';
import openapiTS from 'openapi-typescript';
loadEnvConfig(process.cwd());

async function main() {
    const baseUrl = new URL(process.env.NEXT_PUBLIC_UMBRACO_BASE_URL ?? '');
    const swaggerUrl = new URL(
        '/umbraco/swagger/delivery/swagger.json?urls.primaryName=Umbraco%20Delivery%20API',
        baseUrl,
    );

    const output = await openapiTS(swaggerUrl.toString());

    await fs.promises.writeFile(
        path.join(__dirname, 'src', 'data', 'umbraco', 'schema.d.ts'),
        output,
    );
}

void main();
