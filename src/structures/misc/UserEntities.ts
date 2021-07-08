import type {
  APIUserBaseEntity,
  APIUserCashtagEntity,
  APIUserEntities,
  APIUserEntitiesDescription,
  APIUserHashtagEntity,
  APIUserMentionEntity,
  APIUserURLEntity,
} from 'twitter-types';

export class UserEntities {
  url: UserURLEntity | null;
  description: UserDescriptionEntity | null;

  constructor(data: APIUserEntities) {
    this.url = data.url?.urls[0] ? new UserURLEntity(data.url.urls[0]) : null;
    this.description = data.description ? new UserDescriptionEntity(data.description) : null;
  }
}

export class UserDescriptionEntity {
  urls: Array<UserURLEntity>;
  hashtags: Array<UserHashtagEntity>;
  mentions: Array<UserMentionEntity>;
  cashtags: Array<UserCashtagEntity>;

  constructor(data: APIUserEntitiesDescription) {
    this.urls = this.#patchUrls(data.urls);
    this.hashtags = this.#patchHashtags(data.hashtags);
    this.mentions = this.#patchMentions(data.mentions);
    this.cashtags = this.#patchCashtags(data.cashtags);
  }

  #patchCashtags(rawUserCashtags?: Array<APIUserCashtagEntity>): Array<UserCashtagEntity> {
    const userCashtagsArray: Array<UserCashtagEntity> = [];
    if (!rawUserCashtags) return userCashtagsArray;
    for (const rawUserCashtag of rawUserCashtags) {
      const userCashtag = new UserCashtagEntity(rawUserCashtag);
      userCashtagsArray.push(userCashtag);
    }
    return userCashtagsArray;
  }

  #patchHashtags(rawUserHashtags?: Array<APIUserHashtagEntity>): Array<UserHashtagEntity> {
    const userHashtagsArray: Array<UserHashtagEntity> = [];
    if (!rawUserHashtags) return userHashtagsArray;
    for (const rawUserHashtag of rawUserHashtags) {
      const userHashtag = new UserHashtagEntity(rawUserHashtag);
      userHashtagsArray.push(userHashtag);
    }
    return userHashtagsArray;
  }

  #patchMentions(rawUserMentions?: Array<APIUserMentionEntity>): Array<UserMentionEntity> {
    const userMentionsArray: Array<UserMentionEntity> = [];
    if (!rawUserMentions) return userMentionsArray;
    for (const rawUserMention of rawUserMentions) {
      const userMention = new UserMentionEntity(rawUserMention);
      userMentionsArray.push(userMention);
    }
    return userMentionsArray;
  }

  #patchUrls(rawUserUrls?: Array<APIUserURLEntity>): Array<UserURLEntity> {
    const userUrlsArray: Array<UserURLEntity> = [];
    if (!rawUserUrls) return userUrlsArray;
    for (const rawUserUrl of rawUserUrls) {
      const userUrl = new UserURLEntity(rawUserUrl);
      userUrlsArray.push(userUrl);
    }
    return userUrlsArray;
  }
}

export class UserBaseEntity {
  start: number;
  end: number;

  constructor(data: APIUserBaseEntity) {
    this.start = data.start;
    this.end = data.end;
  }
}

export class UserCashtagEntity extends UserBaseEntity {
  tag: string;

  constructor(data: APIUserCashtagEntity) {
    super(data);

    this.tag = data.tag;
  }
}

export class UserHashtagEntity extends UserBaseEntity {
  tag: string;

  constructor(data: APIUserHashtagEntity) {
    super(data);

    this.tag = data.tag;
  }
}

export class UserMentionEntity extends UserBaseEntity {
  username: string;

  constructor(data: APIUserMentionEntity) {
    super(data);

    this.username = data.username;
  }
}

export class UserURLEntity extends UserBaseEntity {
  url: string;
  expandedURL: string;
  displayURL: string;

  constructor(data: APIUserURLEntity) {
    super(data);

    this.url = data.url;
    this.expandedURL = data.expanded_url;
    this.displayURL = data.display_url;
  }
}
