`use strict`;

const feedModule = require(`./custom_modules/feed_module`);
const bigqueryModule = require(`./custom_modules/bigquery_module`);
const User = require(`./User`);

const fs = require(`fs`).promises;

const accessToken = `c88cecc1e0389b58986ff249ebe15b420da34d939c84d7743a46219986038223cea7e5157507af224bbab`; // --> ключ пользователя Лизы

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
* Отправить рекалмную рассылку пользователям Вконтакте
*
* @param {users} - список пользователей
* */
async function sendAds(users) {
    for (client of users) {
        let textToSend = `Добрый день, ${client.first_name}!
        
        У нас для вас хорошая новость. Наши отделения есть в вашем городе (${client.city}). В них вы можете снять или отправить деньги с карт и кошельков, перевести деньги зарубеж, обменять валюту, пополнить баланс телефона и многое другое. Найдите удобное для вас по адресам ниже, чтобы воспользоваться нашими услугами. 
        Подробнее на сайте pkc24.ru или телефону.
        `;

        const addresses = await bigqueryModule.queryDB(`
            select 
                o.bank_no,
                o.address,
                o.contact_phone
            from
                \`srgykim-dwh.srgykim_dwh_for_tests.pkc_dim_addresses\` o
            where
                1 = 1
                and o.city = '${client.city}'
                and o.open_or_closed = 'Открыто';
        `);

        let nearestAddresses = ``;
        for (address of addresses) {
            nearestAddresses = nearestAddresses.concat(
                `
Отделение №${address.bank_no}:
Адрес: ${address.address}
Телефоны: ${address.contact_phone}
            `
            );
        }
        textToSend = textToSend.concat(nearestAddresses);
        await feedModule.sendMessage(client.id, `https://i.imgur.com/EJrC5x2.png`, textToSend);
        await bigqueryModule.queryDB(`
            update
                \`srgykim-dwh.srgykim_dwh_for_tests.vk_fct_users\` v
            set
                v.ad_sent_flag = 1
            where
                1 = 1
                and v.id = ${client.id};
        `);
    }
}

(async () => {
    // TODO: Раскомменитровать, чтобы найти пользователей
    // const potentialPkcClients = await searchPkcPotentialClients();

    // TODO: Раскомментировать, чтобы разослать рекламу
    const clients = await bigqueryModule.queryDB(`
            -- Список всех пользователей в городах с отделениями ПКЦ
            select 
                distinct
                cast(u.id as string) id,
                u.first_name,
                u.last_name,
                u.country,
                case when u.city = 'Свердловск / Должанск' then 'Свердловск' else u.city end city
            from
                \`srgykim-dwh.srgykim_dwh_for_tests.vk_fct_users\` u
            where
                1 = 1
                and u.ad_sent_flag != 1
                and parse_date('%d.%m.%Y', format_date('%d.%m.%Y', u.time_id)) between 
                    parse_date('%d.%m.%Y', '02.06.2021') 
                        and
                    parse_date('%d.%m.%Y', '02.06.2021')
            order by
                1
    `);
    await sendAds([{id: 176948395, first_name: `Сергей`, last_name: `Ким`, country: `Казахстан`, city: `Ровеньки`}]);
})();
