/* eslint-disable no-console */
import { Connection } from 'typeorm';
import { databaseConnection } from '@database/index';

let connection: Connection;

export const connectDatabase = async () => {
  if (connection) return connection;

  connection = await databaseConnection();
  return connection;
};

export const recreateDatabase = async () => {
  await connectDatabase();
  await connection.dropDatabase();
  await connection.runMigrations();
};

export const closeDatabase = async () => {
  if (connection && connection.isConnected) {
    await connection.close();
  }
};
