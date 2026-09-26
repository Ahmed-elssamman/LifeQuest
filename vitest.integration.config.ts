import { defineConfig } from 'vitest/config';
import ts from 'typescript';
import base from './vitest.config';
export default defineConfig({
  ...base,
  plugins: [
    {
      name: 'nest-decorators',
      enforce: 'pre',
      transform(code, id) {
        if (!id.includes('/apps/api/') || !id.endsWith('.ts')) return;
        const result = ts.transpileModule(code, {
          compilerOptions: {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.ESNext,
            experimentalDecorators: true,
            emitDecoratorMetadata: false,
            sourceMap: true,
          },
          fileName: id,
        });
        return { code: result.outputText, map: result.sourceMapText };
      },
    },
  ],
  test: {
    ...base.test,
    include: ['tests/integration/**/*.spec.ts'],
    setupFiles: ['tests/integration/setup.ts'],
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 60000,
    coverage: {
      ...base.test?.coverage,
      reportsDirectory: 'coverage/api',
      include: ['apps/api/src/**/*.ts'],
      exclude: ['**/main.ts'],
    },
  },
});
