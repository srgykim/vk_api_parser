`use strict`;

const axios = require(`axios`);

/*
* Получить пользователя по ID
* @param {userID} - ID пользователя
* @param {accessToken} - токен авторизации. Может быть получен по ссылке https://developers.facebook.com/tools/explorer
* */
async function getUser(userID, accessToken) {
    try {
        const {data} = await axios.get(`https://api.vk.com/method/users.get?user_ids=${userID}&fields=bdate&access_token=${accessToken}&v=5.131`);

        return data;
    } catch(error) {
        return error;
    }
}

module.exports = {
    getUser
}
