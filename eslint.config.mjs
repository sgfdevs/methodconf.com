import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            '.next/**',
            '.svelte-kit/**',
            'build/**',
            'coverage/**',
            'node_modules/**',
            'next-env.d.ts',
            'next.config.ts',
            'src/app/**',
            'src/components/**',
            'src/config.ts',
            'src/data/**',
            'src/routes/**/*.svelte',
            'src/serverConfig.ts',
            'src/util.ts',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        files: ['**/*.{js,ts,mjs}'],
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            'prettier/prettier': 'error',
        },
    },
);
