import { PollOption } from './misc/Misc.js';
import BaseStructure from './BaseStructure.js';
import type Client from '../client/Client.js';
import type { APIPollObject, APIPollVotingStatus } from 'twitter-types';

export default class Poll extends BaseStructure {
  override id: string;

  options: Array<PollOption>;

  durationMinutes: number | null;

  endDatetime: Date | null;

  votingStatus: APIPollVotingStatus | null;

  constructor(client: Client, data: APIPollObject) {
    super(client, data.id);

    this.id = data.id;
    this.options = data.options.map(option => new PollOption(option));
    this.durationMinutes = data.duration_minutes ?? null;
    this.endDatetime = data.end_datetime ?? null;
    this.votingStatus = data.voting_status ?? null;
  }
}
