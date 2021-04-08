import React from 'react';

import { DataSourceHttpSettings } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { JsonApiDataSourceOptions } from './types';

import {} from '@emotion/core';

type Props = DataSourcePluginOptionsEditorProps<JsonApiDataSourceOptions>;

export const ConfigEditor: React.FC<Props> = ({ options, onOptionsChange }) => {
  return (
    <>
      <DataSourceHttpSettings
        defaultUrl="http://localhost:8080"
        dataSourceConfig={options}
        onChange={onOptionsChange}
      />
    </>
  );
};
