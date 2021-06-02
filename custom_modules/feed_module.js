`use strict`;

const axios = require(`axios`);

/*
* Получить пользователя по ID
* @param {userID} - ID пользователя
* @param {accessToken} - токен авторизации. Может быть получен по ссылке https://developers.facebook.com/tools/explorer
* */
async function getUser(userID, accessToken) {
    try {
        const {data} = await axios.get(encodeURI(`https://api.vk.com/method/users.get?user_ids=${userID}&fields=bdate&access_token=${accessToken}&v=5.131`));

        return data;
    } catch(error) {
        console.error(error);
    }
}

/*
* Найти пользователей по параметрам
* @param {q} - ФИО пользователя
* @param {ageFrom} - возраст от
* @param {ageTo} - возраст до
* @param {accessToken} - токен авторизации.
* */
async function searchUsers(q, city, ageFrom, ageTo, accessToken) {
    try {
        const {data} = await axios.get(encodeURI(`https://api.vk.com/method/users.search?q=${q}&fields=first_name,last_name,screen_name,bdate,city,country,has_mobile,interests,contacts&city=${city}&age_from=${ageFrom}&age_to=${ageTo}&online=1&count=1000&access_token=${accessToken}&v=5.131`));

        return data.response.items;
    } catch(error) {
        console.error(error);
    }
}

/*
* Создать беседу с пользоваетелем Вконтакте.
* @param {userIds} - список ID пользователей
* @param {title} - название беседы
* @param {accessToken} - токен авторизации
* */
async function createChat(userIds, title, accessToken) {
    try {
        await axios.get(encodeURI(`https://api.vk.com/method/messages.createChat?user_ids=${userIds}&title${title}access_token=${accessToken}`))
    } catch(error) {
        console.error(error);
    }
}

module.exports = {
    getUser,
    searchUsers,
    createChat
}
