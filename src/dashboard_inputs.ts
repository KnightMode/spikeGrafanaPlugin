const DashboardInputs: any = {
    svcHealthSummary: {
        name: 'Svc Health Summary',
        fields: [
            {
                baseField: '$.aggregations.response_category_url.buckets[*].key',
                baseFieldName: 'ServiceName',
                childFieldNames: '$.aggregations.response_category_url.buckets[0].response_category.buckets[*].key',
                childFieldValues: '$.aggregations.response_category_url.buckets[*].response_category.buckets[*].doc_count',
            },
        ],
        requestBody: `{
        "size": 0,
        "query": {
            "bool": {
                "must": [
                    {
                        "exists": {
                            "field": "tag.http@status_code"
                        }
                    },
                    {
                        "exists": {
                            "field": "operationName"
                        }
                    },
                    {
                        "range": {
                            "startTimeMillis": {
                                "gte": "{{timeRange.from}}",
                                "lte": "{{timeRange.to}}"
                            }
                        }
                    }
                ]
            }
        },
        "aggs": {
            "response_category_url": {
                "terms": {
                    "field": "process.serviceName"
                },
                "aggs": {
                    "response_category": {
                        "range": {
                            "script": {
                                "lang": "painless",
                                "source": "Integer.parseInt(doc['tag.http@status_code'].value)"
                            },
                            "ranges": [
                                {
                                    "key": "Success",
                                    "to": "201"
                                },
                                {
                                    "key": "Business Error",
                                    "from": "400",
                                    "to": "498"
                                },
                                {
                                    "key": "Technical Error",
                                    "from": "499"
                                },
                                {
                                    "key": "All Errors",
                                    "from": "400"
                                }
                            ]
                        }
                    }
                }
            }
        }
    }`,
        availableColumns: ["Success", "Error", "Error1"]
    },
};

export default DashboardInputs;
