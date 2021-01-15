'use strict';

/**
 * Represents a context annotation parsed by Twitter from the tweet text
 */
class ContextAnnotation {
  /**
   * @param {Object} data
   */
  constructor(data) {
    /**
     * The id of the domain this annotation falls in
     * @type {string}
     */
    this.domainID = data?.domain?.id ? data.domain.id : null;

    /**
     * The name of the domain this annotation falls in
     * @type {string}
     */
    this.domainName = data?.domain?.name ? data.domain.name : null;

    /**
     * The description of the domain this annotation falls in
     * @type {string}
     */
    this.domainDescription = data?.domain?.description ? data.domain.description : null;

    /**
     * The id of the entity this annotation is about
     * @type {string}
     */
    this.entityID = data?.entity?.id ? data.entity.id : null;

    /**
     * The name of the entity this annotation is about
     * @type {string}
     */
    this.entityName = data?.entity?.name ? data.entity.name : null;

    /**
     * The description of the entity this annotaion is about
     * @type {string}
     */
    this.entityDescription = data?.entity?.description ? data.entity.description : null;
  }
}

export default ContextAnnotation;
