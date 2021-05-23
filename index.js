`use strict`;

const feedModule = require (`./custom_modules/feed_module`);
const bigqueryModule = require (`./custom_modules/bigquery_module`);

const fs = require(`fs`).promises;

const accessToken = `5074cae1e0869daeb61f5933de06acc0885722b9f19ab7cb06da45a1b1610713868603c4bb696c9776d97`;

/*
* Сохранить JSON файл в директорию ./dump
* @json - объект для сохранения
* @filename - название выходного файла
* */
async function saveToFile(json, filename) {
    try {
        await fs.writeFile(`./dump/${filename}`, JSON.stringify(json));
    } catch(error) {
        return error;
    }
}

(async () => {
    // TODO: Раскомменитровать, чтобы получить пользователя по ID
    const user = await feedModule.getUser(210700286, accessToken);
    // console.log(user);
    await saveToFile(user, `user.json`);
})();
