import defaults from 'lodash/defaults';
import React, { useState } from 'react';
import {
  Icon,
  InlineFieldRow,
  InlineField,
  Segment,
  Input,
  Select,
  RadioButtonGroup,
  CodeEditor,
  useTheme,
  InfoBox,
} from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { JsonApiQuery, defaultQuery, JsonApiDataSourceOptions, Pair } from './types';
import AutoSizer from 'react-virtualized-auto-sizer';
import { css } from 'emotion';
import { JsonDataSource } from 'datasource';
import DashboardInputs from 'dashboard_inputs';

interface Props extends QueryEditorProps<JsonDataSource, JsonApiQuery, JsonApiDataSourceOptions> {
  limitFields?: number;
}
export const QueryEditor: React.FC<Props> = ({ onRunQuery, onChange, query, limitFields, datasource, range }) => {
  const [bodyType, setBodyType] = useState('plaintext');
  const [tabIndex, setTabIndex] = useState(0);
  const [dashboardName, setDashboardName] = useState('');
  const theme = useTheme();

  const { fields } = defaults(query, { ...defaultQuery, fields: [{ name: '', jsonPath: '' }] }) as JsonApiQuery;

  // Display a warning message when user adds any of the following headers.
  const sensitiveHeaders = ['authorization', 'proxy-authorization', 'x-api-key'];

  const params: Array<Pair<string, string>> = query.params ?? [];

  // Backwards-compatibility with old queryString property.
  if (!query.params) {
    new URLSearchParams('?' + query.queryParams).forEach((value: string, key: string) => {
      params.push([key, value]);
    });
  }

  const onMethodChange = (method: string) => {
    onChange({ ...query, method });
    // onRunQuery();
  };

  const onBodyChange = (body: string) => {
    onChange({ ...query, body });
    onRunQuery();
  };

  const addField = (i: number) => () => {
    if (!limitFields || fields.length < limitFields) {
      onChange({
        ...query,
        fields: [
          ...fields.slice(0, i + 1),
          { name: '', childFieldValues: '', baseField: '', baseFieldName: '', childFieldNames: '' },
          ...fields.slice(i + 1),
        ],
      });
    }
  };

  const removeField = (i: number) => () => {
    onChange({
      ...query,
      fields: [...fields.slice(0, i), ...fields.slice(i + 1)],
    });
    onRunQuery();
  };

  const onHandleDashboardChange = (dashboardName: any) => {
    setDashboardName(dashboardName);
    onChange({
      ...query,
      dashboardName,
    });
    onRunQuery();
  };

  const tabs = [
    {
      title: 'Fields',
      content: fields
        ? fields.map((_field, index) => (
            <InlineFieldRow key={index}>
              <Select
                value={query.dashboardName}
                options={[{ label: 'Service Health Summary', value: 'svcHealthSummary' }]}
                onChange={v => {
                  onHandleDashboardChange(v.value);
                }}
              />

              {(!limitFields || fields.length < limitFields) && (
                <a className="gf-form-label" onClick={addField(index)}>
                  <Icon name="plus" />
                </a>
              )}

              {fields.length > 1 ? (
                <a className="gf-form-label" onClick={removeField(index)}>
                  <Icon name="minus" />
                </a>
              ) : null}
            </InlineFieldRow>
          ))
        : null,
    },
    {
      title: 'Path',
      content: (
        <InlineFieldRow>
          <InlineField>
            <Select
              value={query.method}
              options={[
                { label: 'GET', value: 'GET' },
                { label: 'POST', value: 'POST' },
              ]}
              onChange={v => onMethodChange(v.value ?? 'GET')}
            />
          </InlineField>
          <InlineField grow>
            <Input
              placeholder="/orders/${orderId}"
              value={query.urlPath}
              onChange={e => onChange({ ...query, urlPath: e.currentTarget.value })}
            />
          </InlineField>
        </InlineFieldRow>
      ),
    },
    {
      title: 'Body',
      content: (
        <>
          <InlineFieldRow>
            <InlineField label="Syntax highlighting">
              <RadioButtonGroup
                value={bodyType}
                onChange={v => setBodyType(v ?? 'plaintext')}
                options={[
                  { label: 'Text', value: 'plaintext' },
                  { label: 'JSON', value: 'json' },
                  { label: 'XML', value: 'xml' },
                ]}
              />
            </InlineField>
          </InlineFieldRow>
          {dashboardName && (
            <InlineFieldRow>
              <AutoSizer
                disableHeight
                className={css`
                  margin-bottom: ${theme.spacing.sm};
                `}
              >
                {({ width }) => (
                  <CodeEditor
                    value={DashboardInputs[dashboardName].requestBody || ''}
                    language={bodyType}
                    width={width}
                    height="200px"
                    showMiniMap={false}
                    readOnly={true}
                    showLineNumbers={true}
                    onBlur={onBodyChange}
                  />
                )}
              </AutoSizer>
              {/* <InlineField label="Body" tooltip="foo" grow>
          <JsonQueryField value={body || ''} onChange={} />
        </InlineField> */}
            </InlineFieldRow>
          )}
        </>
      ),
    },
  ];

  return (
    <>
      <InlineFieldRow>
        <InlineField>
          <RadioButtonGroup
            onChange={e => setTabIndex(e ?? 0)}
            value={tabIndex}
            options={tabs.map((tab, idx) => ({ label: tab.title, value: idx }))}
          />
        </InlineField>
        <InlineField
          label="Cache Time"
          tooltip="Time in seconds that the response will be cached in Grafana after receiving it."
        >
          <Segment
            value={{ label: formatCacheTimeLabel(query.cacheDurationSeconds), value: query.cacheDurationSeconds }}
            options={[0, 5, 10, 30, 60, 60 * 2, 60 * 5, 60 * 10, 60 * 30, 3600, 3600 * 2, 3600 * 5].map(value => ({
              label: formatCacheTimeLabel(value),
              value,
              description: value ? '' : 'Response is not cached at all',
            }))}
            onChange={({ value }) => onChange({ ...query, cacheDurationSeconds: value! })}
          />
        </InlineField>
      </InlineFieldRow>
      {query.method === 'GET' && query.body && (
        <InfoBox severity="warning">
          {"GET requests can't have a body. The body you've defined will be ignored."}
        </InfoBox>
      )}
      {(query.headers ?? []).map(([key, _]) => key.toLowerCase()).find(_ => sensitiveHeaders.includes(_)) && (
        <InfoBox severity="warning">
          {
            "It looks like you're adding credentials in the header. Since queries are stored unencrypted, it's strongly recommended that you add any secrets to the data source config instead."
          }
        </InfoBox>
      )}
      {tabs[tabIndex].content}
    </>
  );
};

const defaultCacheDuration = 300;

export const formatCacheTimeLabel = (s: number = defaultCacheDuration) => {
  if (s < 60) {
    return s + 's';
  } else if (s < 3600) {
    return s / 60 + 'm';
  }

  return s / 3600 + 'h';
};
