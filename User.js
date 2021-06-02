`use strict`;

module.exports = class User {
    constructor(
        time_id,
        id,
        first_name,
        last_name,
        screen_name,
        bdate,
        country,
        city,
    ) {
        this.time_id = time_id;
        this.id = id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.screen_name = screen_name;
        this.bdate = bdate;
        this.country = country;
        this.city = city;
    }
}
