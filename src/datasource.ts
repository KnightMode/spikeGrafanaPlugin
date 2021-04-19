import _ from 'lodash';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MetricFindValue,
  FieldType,
  ScopedVars,
  TimeRange,
  MutableDataFrame,
} from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import Mustache from 'mustache';

import API from './api';
import { JsonApiQuery, JsonApiDataSourceOptions, Pair } from './types';
import { JSONPath } from 'jsonpath-plus';
import DashboardInputs from './dashboard_inputs';

export class JsonDataSource extends DataSourceApi<JsonApiQuery, JsonApiDataSourceOptions> {
  api: API;
  json: any;

  constructor(instanceSettings: DataSourceInstanceSettings<JsonApiDataSourceOptions>) {
    super(instanceSettings);

    this.api = new API(instanceSettings.url!, instanceSettings.jsonData.queryParams || '');
  }

  /**
   * metadataRequest is used by the language provider to return the JSON
   * document to generate suggestions for the QueryField.
   *
   * This is a custom method and is not part of the DataSourceApi, feel free to
   * name it as you like.
   */
  async metadataRequest(query: JsonApiQuery, range?: TimeRange) {
    return this.requestJson(query, replace({}, range));
  }

  async query(request: DataQueryRequest<JsonApiQuery>): Promise<DataQueryResponse> {
    const promises = request.targets
      .filter(query => !query.hide)
      .map(query => this.doRequest(query, request.range, request.scopedVars));

    // Wait for all queries to finish before returning the result.
    return Promise.all(promises).then(data => ({ data }));
  }

  /**
   * Returns values for a Query variable.
   *
   * @param query
   */
  async metricFindQuery?(query: JsonApiQuery): Promise<MetricFindValue[]> {
    const frame = await this.doRequest(query);
    return frame.fields[0].values.toArray().map((_: any) => ({ text: _ }));
  }

  /**
   * Checks whether we can connect to the API.
   */
  async testDatasource() {
    const defaultErrorMessage = 'Cannot connect to API';

    try {
      const response = await this.api.test();

      if (response.status === 200) {
        return {
          status: 'success',
          message: 'Success',
        };
      } else {
        return {
          status: 'error',
          message: response.statusText ? response.statusText : defaultErrorMessage,
        };
      }
    } catch (err) {
      if (_.isString(err)) {
        return {
          status: 'error',
          message: err,
        };
      } else {
        let message = 'JSON API: ';
        message += err.statusText ? err.statusText : defaultErrorMessage;
        if (err.data && err.data.error && err.data.error.code) {
          message += ': ' + err.data.error.code + '. ' + err.data.error.message;
        }

        return {
          status: 'error',
          message,
        };
      }
    }
  }

  async doRequest(query: JsonApiQuery, range?: TimeRange, scopedVars?: ScopedVars) {
    const selectedDashboard = DashboardInputs[query.dashboardName];
    const replaceWithVars = replace(scopedVars, range);
    let columns: any[] = [];
    const baseFieldName = selectedDashboard.fields[0].baseFieldName;
    let baseFieldValues: any[] = [];
    let childFieldValues: any[] = [];
    let chunkedVals: any[] = [];
    columns.push(baseFieldName);
    query = { ...query, body: selectedDashboard.requestBody };
    const requestTimeRange: any = {
      timeRange: {
        from: range?.from.format('YYYY-MM-DD hh:mm:ss'),
        to: range?.to.format('YYYY-MM-DD hh:mm:ss'),
      },
    };

    let output = render(selectedDashboard.requestBody, requestTimeRange);
    query = { ...query, body: JSON.parse(output) };
    this.json = await this.requestJson(query, replaceWithVars);

    if (!this.json) {
      throw new Error('Query returned empty data');
    }

    let childColumnVal = JSONPath({ path: selectedDashboard.fields[0].childFieldNames, json: this.json });
    baseFieldValues = JSONPath({ path: selectedDashboard.fields[0].baseField, json: this.json });
    childFieldValues = JSONPath({ path: selectedDashboard.fields[0].childFieldValues, json: this.json });
    childColumnVal.forEach((elem: any) => columns.push(elem));
    chunkedVals = _.chunk(childFieldValues, columns.length - 1);

    const frame = new MutableDataFrame({
      refId: query.refId,
      fields: columns.map(column => ({ name: column, type: FieldType.string })),
    });

    baseFieldValues.forEach((elem, index) => {
      let frameResult = [];
      frameResult.push(elem);
      let currentChunk = chunkedVals[index];
      currentChunk.forEach((element: any) => {
        frameResult.push(element);
      });
      frame.appendRow(frameResult);
    });

    return frame;
  }

  async requestJson(query: JsonApiQuery, interpolate: (text: string) => string) {
    const interpolateKeyValue = ([key, value]: Pair<string, string>): Pair<string, string> => {
      return [interpolate(key), interpolate(value)];
    };

    return await this.api.cachedGet(
      5,
      query.method,
      interpolate(query.urlPath),
      (query.params ?? []).map(interpolateKeyValue),
      (query.headers ?? []).map(interpolateKeyValue),
      interpolate(query.body),
      query.refId
    );
  }
}

const replace = (scopedVars?: any, range?: TimeRange) => (str: string): string => {
  return replaceMacros(getTemplateSrv().replace(str, scopedVars), range);
};

// replaceMacros substitutes all available macros with their current value.
const replaceMacros = (str: string, range?: TimeRange) => {
  return range
    ? str
        .replace(/\$__unixEpochFrom\(\)/g, range.from.unix().toString())
        .replace(/\$__unixEpochTo\(\)/g, range.to.unix().toString())
    : str;
};

function render(template: any, data: any) {
  return Mustache.render(JSON.stringify(template), data);
}
