import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './datasource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import { MyQuery, JsonApiDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<DataSource, MyQuery, JsonApiDataSourceOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
