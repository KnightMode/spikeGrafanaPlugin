import { DataQuery, DataSourceJsonData, FieldType, SelectableValue } from '@grafana/data';

interface JsonField {
  name?: string;
  childFieldValues: string;
  baseField: string;
  baseFieldName: string;
  childFieldNames: string;
  type?: FieldType;
}

export type Pair<T, K> = [T, K];

export interface JsonApiQuery extends DataQuery {
  fields: JsonField[];
  dashboardName: string;
  method: string;
  urlPath: string;
  childColumns: SelectableValue<string>[];
  queryParams: string;
  params: Array<Pair<string, string>>;
  headers: Array<Pair<string, string>>;
  body: string;
  cacheDurationSeconds: number;
}

export const defaultQuery: Partial<JsonApiQuery> = {
  cacheDurationSeconds: 300,
  method: 'GET',
  queryParams: '',
  urlPath: '',
};

export interface JsonApiDataSourceOptions extends DataSourceJsonData {
  queryParams?: string;
}
