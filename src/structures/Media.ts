import BaseStructure from './BaseStructure.js';
import type { APIMediaObject, APIMediaType } from 'twitter-types';
import type { ClientInUse, ClientUnionType } from '../typings/Types.js';
import {
  MediaNonPublicMetrics,
  MediaOrganicMetrics,
  MediaPromotedMetrics,
  MediaPublicMetrics,
} from './misc/MediaMetrics.js';

/**
 * The class that represents a media content in a {@link Tweet}
 */
export default class Media<C extends ClientUnionType> extends BaseStructure<C> {
  id: string;

  type: APIMediaType;

  duration: number | null;

  height: number | null;

  nonPublicMetrics: MediaNonPublicMetrics | null;

  organicMetrics: MediaOrganicMetrics | null;

  previewImageURL: string | null;

  promotedMetrics: MediaPromotedMetrics | null;

  publicMetrics: MediaPublicMetrics | null;

  url: string | null;

  width: number | null;

  constructor(client: ClientInUse<C>, data: APIMediaObject) {
    super(client);

    this.id = data.media_key;
    this.type = data.type;
    this.duration = data.duration_ms ?? null;
    this.height = data.height ?? null;
    this.nonPublicMetrics = data.non_public_metrics ? new MediaNonPublicMetrics(data.non_public_metrics) : null;
    this.organicMetrics = data.organic_metrics ? new MediaOrganicMetrics(data.organic_metrics) : null;
    this.previewImageURL = data.preview_image_url ?? null;
    this.promotedMetrics = data.promoted_metrics ? new MediaPromotedMetrics(data.promoted_metrics) : null;
    this.publicMetrics = data.public_metrics ? new MediaPublicMetrics(data.public_metrics) : null;
    this.url = data.url ?? null;
    this.width = data.width ?? null;
  }
}
