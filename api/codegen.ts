// overwrite: true
// schema: "./schema.graphql"
// documents: null
// generates:
//   gql/:
//     preset: client
//   ./generated/graphql.ts:
//     plugins:
//       - "typescript"
//       - "typescript-resolvers"
//     config:
//       useIndexSignature: true
//       # More on this below!
//       # contextType: "../index#MyContext"

import { CodegenConfig } from "@graphql-codegen/cli";

// TODO with more time I need to prune this nonsense
const config: CodegenConfig = {
  schema: "./schema.graphql",
  // documents: ["src/**/*.tsx"],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "./gql/": {
      preset: "client",
    },
  },
};

export default config;
