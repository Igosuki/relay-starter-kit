#!/usr/bin/env babel-node --optional es7.asyncFunctions

import fs from 'fs';
import path from 'path';
import { Schema, UserSchema } from '../data/schema';
import { graphql }  from 'graphql';
import { introspectionQuery, printSchema } from 'graphql/utilities';

// Save JSON of full schema introspection for Babel Relay Plugin to use
async () => {
  var result = await (graphql(Schema, introspectionQuery));
  if (result.errors) {
    console.error(
      'ERROR introspecting schema: ',
      JSON.stringify(result.errors, null, 2)
    );
}();

async () => {
  var result = await (graphql(UserSchema, introspectionQuery));

  if (result.errors) {
    console.log('ERROR: ', JSON.stringify(result.errors, null, 2));
  }
}();

// Save user readable type system shorthand of schema
fs.writeFileSync(
  path.join(__dirname, '../data/schema.graphql'),
  printSchema(Schema)
);
fs.writeFileSync(
  path.join(__dirname, '../data/user_schema.graphql'),
  printSchema(schema)
);
