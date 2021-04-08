import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  queryText?: string;
  constant: number;
  childFields: string[];
  baseField: string;
  baseurl: string;
  body: string;
  method: string;
}

export const defaultQuery: Partial<MyQuery> = {
  constant: 6.5,
  childFields: [],
  baseurl: 'http://localhost:8080',
  method: 'GET',
};

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKey?: string;
}

export interface JsonApiDataSourceOptions extends DataSourceJsonData {
  queryParams?: string;
}
