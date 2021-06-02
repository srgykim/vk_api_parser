`use strict`;

const feedModule = require(`./custom_modules/feed_module`);
const bigqueryModule = require(`./custom_modules/bigquery_module`);
const User = require(`./User`);

const fs = require(`fs`).promises;

const accessToken = `e45fce560c48b653ac06e2fdf6d012dbf3a780ab2b0330038a76a0c039f0f20313e9a2c813765ebe1baf2`;

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

/*
* Найти всех пользователей - потеницальных клиентов ПКЦ.
*
* */
async function searchPkcPotentialClients() {
    cityIds = [
        2832
        ,552
        ,12889
        ,248
        ,3928
        ,1507264
        ,22477
        ,5648
        ,5806
        ,1507023
        ,3369
        ,4676
        ,3827
        ,7167
        ,11267
    ];

    let allUsers = [];
    for (cityId of cityIds) {
        let users = await feedModule.searchUsers(``, `${cityId}`, `1`, `100`, accessToken);

        users = await users.filter((user) => {
            return (user.is_closed == false);
        });

        for (user of users) {
            if (user.hasOwnProperty('country') && user.hasOwnProperty('city') && cityIds.indexOf(user.city.id) > -1) {
                let parsedUser = await JSON.parse(JSON.stringify(new User(
                    new Date().toISOString()
                        .replace(/T/, ` `)
                        .replace(/\..+/, ``),
                    user.id,
                    user.first_name,
                    user.last_name,
                    user.screen_name,
                    user.bdate,
                    user.country.title,
                    user.city.title
                )));
                await allUsers.push(parsedUser);
            }
        }
    }

    await bigqueryModule.insertRowsAsStream(allUsers, `vk_fct_users`, `srgykim_dwh_for_tests`);

    return allUsers;
}

/*
* Рассылка с приглашениями.
*
* @param {users} - список пользователей
* */
async function sendAdMessages(users) {
    for (user of users) {
        await feedModule.createChat(user.id, `Тестовая API беседа`, accessToken);
        console.log(user);
    }
}

(async () => {
    // TODO: Раскомменитровать, чтобы найти пользователей
    // const potentialPkcClients = await searchPkcPotentialClients();

    // TODO: Раскомментировать, чтобы начать рассылку
    // await sendAdMessages([{ id: `176948395` }]);
})();
