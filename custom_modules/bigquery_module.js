`use strict`;

process.env.GOOGLE_APPLICATION_CREDENTIALS = `./bigquery_key/srgykim-dwh-18c843600ac3.json`;

const {BigQuery} = require(`@google-cloud/bigquery`);

const bigqueryClient = new BigQuery();

/*
* Добавить записи в БД.
* @param {rows} - список объектов
* @{tableId} - название таблицы
* @{datasetId} - название набора данных
* */
async function insertRowsAsStream(rows, tableId, datasetId) {
    try {
        await bigqueryClient
            .dataset(datasetId)
            .table(tableId)
            .insert(rows);
    } catch(error) {
        console.error(error);
    }
}

/*
* Выполнить запрос в БД
* @param {sqlQuery} - запрос в БД в виде строки
* */
async function queryDB(sqlQuery) {
    const options = {
        query: sqlQuery
    };
    const [rows] = await bigqueryClient.query(options);

    return rows;
}

module.exports = {
    insertRowsAsStream,
    queryDB
}
