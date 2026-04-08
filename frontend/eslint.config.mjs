import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

const eslintConfig = [
    {
        ignores: ['src/data/umbraco/*.d.ts'],
    },
    ...nextCoreWebVitals,
    ...nextTypeScript,
    {
        rules: {
            '@typescript-eslint/consistent-type-imports': 'error',
        },
    },
    eslintPluginPrettierRecommended,
];

export default eslintConfig;
