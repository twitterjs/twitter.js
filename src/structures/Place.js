/**
 * Represents a place tagged in a tweet
 */
class Place {
  constructor(data) {
    /**
     * The full name of the place
     * @type {string}
     */
    this.fullName = data.full_name;

    /**
     * The id of the place
     * @type {string}
     */
    this.id = data.id;

    /**
     * The name of the country the place belongs to
     * @type {string}
     */
    this.country = data.country;

    /**
     * The ISO Alpha-2 country code of the country the place belongs to
     * @type {string}
     */
    this.countryCode = data.country_code;

    /**
     * The place details
     * @type {?Object}
     */
    this.geo = null;

    /**
     * The short name of the place
     * @type {string}
     */
    this.name = data.name;

    /**
     * The type of the place
     * @type {string}
     */
    this.type = data.place_type;
  }
}

export default Place;
