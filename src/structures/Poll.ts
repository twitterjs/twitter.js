import { PollOption } from './misc/Misc.js';
import BaseStructure from './BaseStructure.js';
import { ClientInUse, ClientUnionType } from '../typings/Types.js';
import type { APIPoll, APIPollVotingStatus } from 'twitter-types';

/**
 * The class that represents a poll in a {@link Tweet}
 */
export default class Poll<C extends ClientUnionType> extends BaseStructure<C> {
  id: string;

  options: Array<PollOption>;

  durationMinutes: number | null;

  endDatetime: Date | null;

  votingStatus: APIPollVotingStatus | null;

  constructor(client: ClientInUse<C>, data: APIPoll) {
    super(client);

    this.id = data.id;
    this.options = data.options.map(option => new PollOption(option));
    this.durationMinutes = data.duration_minutes ?? null;
    this.endDatetime = data.end_datetime ?? null;
    this.votingStatus = data.voting_status ?? null;
  }
}
