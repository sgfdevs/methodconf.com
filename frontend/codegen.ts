import type { CodegenConfig } from '@graphql-codegen/cli';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const config: CodegenConfig = {
    overwrite: true,
    schema: process.env.GRAPHQL_ENDPOINT,
    generates: {
        'src/gql/': {
            preset: 'client',
            plugins: [],
        },
    },
};

export default config;
