import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import svelte from 'eslint-plugin-svelte';
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
            'src/lib/umbraco/*ApiSchema.d.ts',
            'src/serverConfig.ts',
            'src/util.ts',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...svelte.configs.recommended,
    ...svelte.configs.prettier,
    prettier,
    {
        files: ['src/routes/**/*.svelte', 'src/lib/**/*.svelte'],
        languageOptions: {
            parserOptions: {
                parser: tseslint.parser,
                extraFileExtensions: ['.svelte'],
            },
        },
    },
    {
        files: ['**/*.{js,ts,mjs,svelte}'],
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            'prettier/prettier': 'error',
        },
    },
);
