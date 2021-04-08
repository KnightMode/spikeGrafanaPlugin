import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, JsonApiDataSourceOptions, MyQuery } from './types';

const { FormField } = LegacyForms;

type Props = QueryEditorProps<DataSource, MyQuery, JsonApiDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, queryText: event.target.value });
  };

  onFrequencyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;

    onChange({ ...query, childFields: event.target.value.split(',') });
    // executes the query
    onRunQuery();
  };

  onBaseFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;

    onChange({ ...query, baseField: event.target.value });
    // executes the query
    onRunQuery();
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { queryText, childFields, baseurl, baseField } = query;

    return (
      <div className="gf-form">
        <FormField
          labelWidth={8}
          value={queryText || ''}
          onChange={this.onQueryTextChange}
          label="Query Text"
          tooltip="Not used yet"
        />
        <FormField width={10} value={childFields} onChange={this.onFrequencyChange} label="ChildFields" type="string" />
        <FormField width={4} value={baseField} onChange={this.onBaseFieldChange} label="BaseField" type="string" />
        <FormField width={4} value={baseurl} onChange={() => {}} label="BaseUrl" type="string" />
      </div>
    );
  }
}
