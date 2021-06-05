`use strict`;

const axios = require(`axios`);
const easyvk = require(`easyvk`);
const fs = require(`fs`);

/*
* Получить пользователя по ID.
* @param {userID} - ID пользователя
* @param {accessToken} - токен авторизации
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
* Найти пользователей по параметрам.
* @param {q} - ФИО пользователя
* @param {ageFrom} - возраст от
* @param {ageTo} - возраст до
* @param {accessToken} - токен авторизации
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
* Отправить сообщение VK с вложенной картинкой.
*
* @param {userId} - ID пользователия Вконтакте
* @param {imageUrl} - ссылка на изображение
* @param {adText} - рекламный текст для отправки
* */
async function sendMessage(userId, imageUrl, adText) {
    try {
        easyvk({ /** Авторизуемся */
            username: `juliafirstpkc24@gmail.com`,
            password: `pkc24_vk_PASS`
        }).then(async vk => {
            /** Получаем URL для загрузки */
            let {upload_url: uploadUrl} = await vk.call(`photos.getMessagesUploadServer`, {
                peer_id: userId
            });

            /** Загружаем файл (url, file, field - photo, как в документации) */
            let file =  await vk.uploader.uploadFetchedFile(uploadUrl, imageUrl, `photo`);

            /** Сохряняем изображение */
            let photo = await vk.post('photos.saveMessagesPhoto', file);
            photo = photo[0];

            /** Отправляем сообщение */
            let response = await vk.call(`messages.send`, {
                peer_id: userId,
                message: adText,
                attachment: [
                    `photo${photo.owner_id}_${photo.id}_${photo.access_key}`,
                ],
                /** Получаем случайное число с привязкой к дате*/
                random_id: easyvk.randomId()
            })
        });
    } catch(error) {
        throw error;
    }
}

/**
 * Считать файл с сообщениями.
 * @param path - путь к файлу
 */
function readMessagesFromFile(path){
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.toString().split(`\n`));
            }
        });
    });
}

module.exports = {
    getUser,
    searchUsers,
    sendMessage,
    readMessagesFromFile
}
