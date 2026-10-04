import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const projectRoot = process.cwd();
const eslintBin = join(projectRoot, 'node_modules/eslint/bin/eslint.js');
const regressionFiles = [
    join(projectRoot, 'src/routes/__eslint-coverage__.svelte'),
    join(projectRoot, 'src/lib/__eslint-coverage__.svelte'),
];

const badSvelteComponent = `<script lang="ts">
    const rawHtml: string = '<strong>bad</strong>';
    const unusedValue: number = 1;
</script>

{@html rawHtml}
`;

const removeRegressionFiles = () => {
    for (const file of regressionFiles) {
        rmSync(file, { force: true });
    }
};

describe('Svelte ESLint coverage', () => {
    afterEach(removeRegressionFiles);

    it('lints current route components and future library components', () => {
        for (const file of regressionFiles) {
            mkdirSync(dirname(file), { recursive: true });
            writeFileSync(file, badSvelteComponent);

            const result = spawnSync(
                process.execPath,
                [eslintBin, file, '--max-warnings', '0'],
                {
                    cwd: projectRoot,
                    encoding: 'utf8',
                },
            );

            const output = `${result.stdout}\n${result.stderr}`;

            expect(result.status).not.toBe(0);
            expect(output).toContain('@typescript-eslint/no-unused-vars');
            expect(output).toContain('svelte/no-at-html-tags');

            rmSync(file, { force: true });
        }
    });
});
