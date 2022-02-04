import {Entity, model, property} from '@loopback/repository';

@model()
export class State extends Entity {
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
    type: 'boolean',
    required: true,
  })
  paused: boolean;

  @property({
    type: 'number',
    required: true,
  })
  epoch: number;


  constructor(data?: Partial<State>) {
    super(data);
  }
}

export interface StateRelations {
  // describe navigational properties here
}

export type StateWithRelations = State & StateRelations;
