import fs from 'node:fs';
import path from 'path';
import { loadEnvConfig } from '@next/env';
import openapiTS, { astToString } from 'openapi-typescript';
loadEnvConfig(process.cwd());

async function main() {
    const baseUrl = new URL(process.env.NEXT_PUBLIC_UMBRACO_BASE_URL ?? '');

    const schemaConfigs = [
        {
            url: new URL(
                '/umbraco/swagger/delivery/swagger.json?urls.primaryName=Umbraco+Delivery+API',
                baseUrl,
            ),
            outputFile: `deliveryApiSchema.d.ts`,
        },

        {
            url: new URL(
                '/umbraco/swagger/default/swagger.json?urls.primaryName=Default+API',
                baseUrl,
            ),
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
