import { Pool, QueryResult, QueryResultRow } from 'pg';

export type DatabasePool = Pool;

export type DatabaseQueryResult<T extends QueryResultRow = QueryResultRow> = QueryResult<T>;

export type DatabaseRow = Record<string, unknown>;


