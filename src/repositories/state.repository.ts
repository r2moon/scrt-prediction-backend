import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PredictionDataSource} from '../datasources';
import {State, StateRelations} from '../models';

export class StateRepository extends DefaultCrudRepository<
  State,
  typeof State.prototype.id,
  StateRelations
> {
  constructor(
    @inject('datasources.prediction') dataSource: PredictionDataSource,
  ) {
    super(State, dataSource);
  }
}
