import defaults from 'lodash/defaults';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { MyQuery, JsonApiDataSourceOptions, defaultQuery } from './types';

export class DataSource extends DataSourceApi<MyQuery, JsonApiDataSourceOptions> {
  url: string;
  constructor(instanceSettings: DataSourceInstanceSettings<JsonApiDataSourceOptions>) {
    super(instanceSettings);
    this.url = instanceSettings.url! || 'http://localhost:8080';
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const data = options.targets.map(target => {
      const query = defaults(target, defaultQuery);
      query.baseurl = this.url;
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
      const sampleData = [
        {
          baseField: 'ABC-1',
          childFields: [
            {
              doc_count: 23850053,
            },
            {
              doc_count: 23123,
            },
            {
              doc_count: 23123,
            },
          ],
        },
        {
          baseField: 'ABC-2',
          childFields: [
            {
              doc_count: 238,
            },
            {
              doc_count: 231,
            },
            {
              doc_count: 244,
            },
          ],
        },
      ];
      query.childFields.unshift(query.baseField);
      const frame = new MutableDataFrame({
        refId: query.refId,
        fields: query.childFields.map(element => {
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
      // sampleData.buckets.forEach(elem => {
      //   const svcName: string = elem.key;
      //   frame.appendRow([
      //     svcName,
      //     elem.response_category.buckets[0].doc_count,
      //     elem.response_category.buckets[1].doc_count,
      //     elem.response_category.buckets[2].doc_count,
      //   ]);
      // });
      // const apiData: { [index: string]: any } = [
      //   { name: 'field1', some: 'data' },
      //   { name: 'field2', some: 'data' },
      // ];

      // const nameKey: string = frame.fields[0].name;
      // const newLocal = apiData.map((elem: string) => elem[nameKey]);
      // frame.appendRow(newLocal);
      sampleData.forEach(elem => {
        let frameResult = [elem.baseField];
        elem.childFields.forEach(cf => {
          frameResult.push(String(cf.doc_count));
        });
        frame.appendRow(frameResult);
        
      });
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
