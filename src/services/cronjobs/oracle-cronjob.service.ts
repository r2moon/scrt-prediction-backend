import {inject} from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import {OracleService} from '../';

@cronJob()
export class OracleCronJobService extends CronJob {
  constructor(
    @inject('services.OracleService')
    private oracleService: OracleService,
  ) {
    super({
      name: 'oracle-cronjob',
      onTick: async () => {
        try {
          await this.oracleService.updatePrice();
        } catch (err) {
          console.error(err);
        }
      },
      cronTime: '0 */1 * * * *',
      start: true,
    });
  }
}
