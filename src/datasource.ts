import defaults from 'lodash/defaults';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  resolution: number;
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.resolution = instanceSettings.jsonData.resolution || 1000.0;
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const data = options.targets.map(target => {
      const query = defaults(target, defaultQuery);
      // const sampleData = {
      //   buckets: [
      //     {
      //       key: 'ABC-1',
      //       doc_count: 23897751,
      //       response_category: {
      //         buckets: [
      //           {
      //             key: 'Success',
      //             to: 201,
      //             doc_count: 23850053,
      //           },
      //           {
      //             key: 'Error',
      //             to: 500,
      //             doc_count: 23123,
      //           },
      //           {
      //             key: 'Technical Error',
      //             to: 400,
      //             doc_count: 23123,
      //           },
      //         ],
      //       },
      //     },
      //     {
      //       key: 'ABC-2',
      //       doc_count: 2389771,
      //       response_category: {
      //         buckets: [
      //           {
      //             key: 'Success',
      //             to: 201,
      //             doc_count: 238,
      //           },
      //           {
      //             key: 'Error',
      //             to: 500,
      //             doc_count: 231,
      //           },
      //           {
      //             key: 'Technical Error',
      //             to: 400,
      //             doc_count: 244,
      //           },
      //         ],
      //       },
      //     },
      //   ],
      // };
      const frame = new MutableDataFrame({
        refId: query.refId,
        fields: query.fields.map(element => {
          return { name: element, type: FieldType.string };
        }),
      });
      // const tsf = sampleData.buckets.map(bucket => {
      //   const serviceName = bucket.key;
      //   console.log(serviceName);
      //   return {
      //     svc: serviceName,
      //     buckets: bucket.response_category.buckets.map(erbkts => ({
      //       status: erbkts.key,
      //       count: erbkts.doc_count,
      //     })),
      //   };
      // });
      // tsf.forEach(elem => {
      //   frame.appendRow([elem.svc, elem.buckets[0].count, elem.buckets[1].count, elem.buckets[2].count]);
      // });
      // const apiData: { [index: string]: any } = [
      //   { name: 'field1', some: 'data' },
      //   { name: 'field2', some: 'data' },
      // ];

      // const nameKey: string = frame.fields[0].name;
      // const newLocal = apiData.map((elem: string) => elem[nameKey]);
      // frame.appendRow(newLocal);

      return frame;
    });

    return { data };
  }

  async testDatasource() {
    // Implement a health check for your data source.
    return {
      status: 'success',
      message: 'Success',
    };
  }
}
