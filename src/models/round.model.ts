import {Entity, model, property} from '@loopback/repository';

@model()
export class Round extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  asset: string;

  @property({
    type: 'boolean',
    required: true,
  })
  isNative: boolean;

  @property({
    type: 'number',
    required: true,
  })
  roundId: number;

  @property({
    type: 'number',
    postgresql: {
      dataType: 'float',
    },
  })
  openPrice?: number;

  @property({
    type: 'number',
    postgresql: {
      dataType: 'float',
    },
  })
  closePrice?: number;

  @property({
    type: 'number',
    required: true,
  })
  startTime: number;

  @property({
    type: 'number',
    required: true,
  })
  lockTime: number;

  @property({
    type: 'number',
    required: true,
  })
  endTime: number;

  @property({
    type: 'string',
    required: true,
  })
  upBetAmount: string;

  @property({
    type: 'string',
    required: true,
  })
  downBetAmount: string;

  constructor(data?: Partial<Round>) {
    super(data);
  }
}

export interface RoundRelations {
  // describe navigational properties here
}

export type RoundWithRelations = Round & RoundRelations;
