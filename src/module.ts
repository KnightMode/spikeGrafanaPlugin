import { DataSourcePlugin } from '@grafana/data';
import { JsonDataSource } from './datasource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import { JsonApiQuery, JsonApiDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<JsonDataSource, JsonApiQuery, JsonApiDataSourceOptions>(JsonDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
