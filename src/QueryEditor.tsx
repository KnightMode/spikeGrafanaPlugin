import defaults from 'lodash/defaults';
import React, { useState } from 'react';
import {
  Field,
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
            <div key={index}>
              <Select
                value={query.dashboardName}
                options={[{ label: 'Service Health Summary', value: 'svcHealthSummary' }]}
                onChange={v => {
                  onHandleDashboardChange(v.value);
                }}
              />
            </div>
          ))
        : null,
    },
    {
      title: 'Path',
      content: (
        <div>
          <Field>
            <Select
              value={query.method}
              options={[
                { label: 'GET', value: 'GET' },
                { label: 'POST', value: 'POST' },
              ]}
              onChange={v => onMethodChange(v.value ?? 'GET')}
            />
          </Field>
          <Field>
            <Input
              placeholder="/orders/${orderId}"
              value={query.urlPath}
              onChange={e => onChange({ ...query, urlPath: e.currentTarget.value })}
            />
          </Field>
        </div>
      ),
    },
    {
      title: 'Body',
      content: (
        <>
          <div>
            <Field label="Syntax highlighting">
              <RadioButtonGroup
                value={bodyType}
                onChange={v => setBodyType(v ?? 'plaintext')}
                options={[
                  { label: 'Text', value: 'plaintext' },
                  { label: 'JSON', value: 'json' },
                  { label: 'XML', value: 'xml' },
                ]}
              />
            </Field>
          </div>
          {dashboardName && (
            <div>
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
            </div>
          )}
        </>
      ),
    },
  ];

  return (
    <>
      <div>
        <Field>
          <RadioButtonGroup
            onChange={e => setTabIndex(e ?? 0)}
            value={tabIndex}
            options={tabs.map((tab, idx) => ({ label: tab.title, value: idx }))}
          />
        </Field>
        <Field
          label="Cache Time"
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
        </Field>
      </div>
      {query.method === 'GET' && query.body && (
        <InfoBox>
          {"GET requests can't have a body. The body you've defined will be ignored."}
        </InfoBox>
      )}
      {(query.headers ?? []).map(([key, _]) => key.toLowerCase()).find(_ => sensitiveHeaders.includes(_)) && (
        <InfoBox>
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
