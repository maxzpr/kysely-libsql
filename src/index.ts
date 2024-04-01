import { createClient, Client, InArgs, Transaction } from "@libsql/client";
import * as kysely from "kysely";

export interface LibsqlDialectConfig {
  client?: Client,
  url?: string,
  authToken?: string,
}

export class LibsqlDialect implements kysely.Dialect {
  config: LibsqlDialectConfig

  constructor(_config: LibsqlDialectConfig) {
    this.config = _config;
  }

  createAdapter(): kysely.DialectAdapter {
    return new kysely.SqliteAdapter();
  }

  createDriver(): kysely.Driver {
    let client: Client;
    let closeClient: boolean;
    if (this.config.client !== undefined) {
      client = this.config.client;
      closeClient = false;
    } else if (this.config.url !== undefined) {
      client = createClient({ url: this.config.url, authToken: this.config?.authToken });
      closeClient = true;
    } else {
      throw new Error("Please specify either `client` or `url` in the LibsqlDialect config");
    }

    return new LibSqlDriver(client, closeClient);
  }

  createIntrospector(db: kysely.Kysely<any>): kysely.DatabaseIntrospector {
    return new kysely.SqliteIntrospector(db);
  }

  createQueryCompiler(): kysely.QueryCompiler {
    return new kysely.SqliteQueryCompiler();
  }
}

export class LibSqlDriver implements kysely.Driver {
  client: Client;
  closeClient: boolean;
  transaction: Transaction | null = null;

  constructor(_client: Client, _closeClient: boolean) {
    this.client = _client;
    this.closeClient = _closeClient;
  }

  async init(): Promise<void> {

  }

  async acquireConnection(): Promise<LibSqlConnection> {
    return new LibSqlConnection(this.client);
  }

  async beginTransaction(
    connection: LibSqlConnection,
    _settings: kysely.TransactionSettings,
  ): Promise<void> {
    this.transaction = await connection.client.transaction("write");
    // await connection.client.execute("BEGIN IMMEDIATE");
  }

  async commitTransaction(connection: LibSqlConnection): Promise<void> {
    // await connection.client.execute("COMMIT");
    await this.transaction?.commit();
  }

  async rollbackTransaction(connection: LibSqlConnection): Promise<void> {
    // await connection.client.execute("ROLLBACK");
    await this.transaction?.rollback();
  }

  async releaseConnection(connection: LibSqlConnection): Promise<void> {
    connection.client.close();
  }

  async destroy(): Promise<void> {
    if (this.closeClient) {
      this.client.close();
    }
  }
}

export class LibSqlConnection implements kysely.DatabaseConnection {
  client: Client;

  constructor(_client: Client) {
    this.client = _client;
  }

  async executeQuery<R>(compiledQuery: kysely.CompiledQuery): Promise<kysely.QueryResult<R>> {
    const rowsResult = await this.client.execute({
      sql: compiledQuery.sql,
      args: compiledQuery.parameters as InArgs,
    });

    const { rowsAffected, rows, lastInsertRowid } = rowsResult;

    return {
      numAffectedRows: rowsAffected ? BigInt(rowsAffected) : undefined,
      insertId: lastInsertRowid,
      rows: rows as R[],
    };
  }

  async *streamQuery<R>(
    _compiledQuery: kysely.CompiledQuery,
    _chunkSize: number,
  ): AsyncIterableIterator<kysely.QueryResult<R>> {
    throw new Error("LibSql protocol does not support streaming yet");
  }
}