import { defineConfig } from 'orval'

export default defineConfig({
  treeApi: {
    input: {
      target: '../api-contract/openapi.yaml',
      filters: {
        mode: 'exclude',
        tags: [/.*/],
        includeUnreferencedSchemas: true,
      },
    },
    output: {
      target: 'src/shared/api/generated/api-types.ts',
      schemas: false,
      mode: 'single',
      clean: true,
      formatter: 'prettier',
      indexFiles: false,
      override: {
        useTypeOverInterfaces: true,
        enumGenerationType: 'const',
      },
    },
  },
})
