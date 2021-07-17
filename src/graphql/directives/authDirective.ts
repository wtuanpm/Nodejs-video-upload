/* eslint-disable no-param-reassign */
import { ErrorCodes, RoleCodes } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';
import { defaultFieldResolver } from 'graphql';
import { SchemaDirectiveVisitor } from 'graphql-tools';

export class AuthDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    this.ensureFieldsWrapped(type);
    type.requiredAuthRole = this.args.requires;
  }

  // Visitor methods for nested types like fields and arguments
  // also receive a details object that provides information about
  // the parent and grandparent types.
  visitFieldDefinition(field: any, details) {
    this.ensureFieldsWrapped(details.objectType);
    field.requiredAuthRole = this.args.requires;
  }

  ensureFieldsWrapped = (objectType) => {
    // Mark the GraphQLObjectType object to avoid re-wrapping:
    // eslint-disable-next-line no-underscore-dangle
    if (objectType._authFieldsWrapped) return;
    // eslint-disable-next-line no-underscore-dangle
    objectType._authFieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName];
      const { resolve = defaultFieldResolver } = field;
      field.resolve = async (...args) => {
        // Get the required Role from the field first, falling back
        // to the objectType if no Role is required by the field:
        // to be undefined when without directive
        // to be [] when @auth
        // to be [1,2...] when @auth([USER, STAFF ...])
        const requiredRole: number[] | undefined = field.requiredAuthRole || objectType.requiredAuthRole;

        const { auth }: { auth: { role: RoleCodes } } = args[2];

        if (typeof requiredRole === 'undefined') {
          return resolve.apply(this, args);
        }

        if (!auth) {
          throw makeGraphqlError('Unauthenticated!', ErrorCodes.Unauthenticated);
        }

        if (requiredRole.length && requiredRole.indexOf(auth.role) === -1) {
          throw makeGraphqlError('Unauthenticated!', ErrorCodes.Forbidden);
        }

        return resolve.apply(this, args);
      };
    });
  };
}

export default {
  AuthDirective,
};
