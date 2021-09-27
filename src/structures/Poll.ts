import { PollOption } from './misc';
import { BaseStructure } from './BaseStructure';
import type { Client } from '../client';
import type { APIPoll, APIPollVotingStatus } from 'twitter-types';

/**
 * The class that represents a poll in a {@link Tweet}
 */
export class Poll extends BaseStructure {
  options: Array<PollOption>;

  durationMinutes: number | null;

  endDatetime: Date | null;

  votingStatus: APIPollVotingStatus | null;

  constructor(client: Client, data: APIPoll) {
    super(client, data);
    this.options = data.options.map(option => new PollOption(option));
    this.durationMinutes = data.duration_minutes ?? null;
    this.endDatetime = data.end_datetime ? new Date(data.end_datetime) : null;
    this.votingStatus = data.voting_status ?? null;
  }
}
