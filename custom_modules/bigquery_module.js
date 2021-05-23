`use strict`;

process.env.GOOGLE_APPLICATION_CREDENTIALS = `./bigquery_key/srgykim-dwh-18c843600ac3.json`;

const {BigQuery} = require(`@google-cloud/bigquery`);

const bigqueryClient = new BigQuery();

async function insertRowsAsStream(rows, tableId, datasetId) {
    await bigqueryClient
        .dataset(datasetId)
        .table(tableId)
        .insert(rows);
}

async function insertRowsAsStream(rows, tableId, datasetId) {
    await bigqueryClient
        .dataset(datasetId)
        .table(tableId)
        .insert(rows);
}

module.exports = {
    insertRowsAsStream
}
