'use strict';

// holds classes to create objects for small responses returned by some endpoints

/**
 * Response sent when the user follows someone
 */
export class FollowRequest {
  constructor(response) {
    /**
     * Whether the user started following someone
     * @type {?boolean}
     */
    this.following = response?.data?.following ?? null;

    /**
     * Whether the follow request is pending
     * @type {?boolean}
     */
    this.pendingFollow = response?.data?.pending_follow ?? null;
  }
}

/**
 * Response sent when a reply is (un)hidden
 */
export class ReplyState {
  constructor(response) {
    /**
     * Whether the reply is hidden or not
     * @type {?boolean}
     */
    this.hidden = response?.data?.hidden ?? null;
  }
}
