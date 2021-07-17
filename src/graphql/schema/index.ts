import { join, basename } from 'path';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { importSchema } from 'graphql-import';
import resolvers from '@services/index';
import { AuthDirective } from '@graphql/directives/authDirective';

const pathToSchema = join(__filename.replace(basename(__filename), ''), './schema.graphql');
const typeDefs = importSchema(pathToSchema);

const schema = makeExecutableSchema({
  typeDefs: typeDefs,
  resolvers: {
    ...resolvers,
    ID: {
      parseValue: (value) => {
        const id = parseInt(value);
        if (Number.isNaN(id)) {
          return parseInt(value);
        }
        return id;
      },
      serialize: (value) => {
        return value.toString();
      },
      parseLiteral: (ast) => {
        return ast.value;
      },
    },
  },
  schemaDirectives: {
    auth: AuthDirective,
  },
});

export default schema;
