import {inject} from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import {ExecuteService} from '../';
import {SCRT_ASSET_INFO} from '../../constants';

@cronJob()
export class ExecuteCronJobService extends CronJob {
  constructor(
    @inject('services.ExecuteService')
    private executeService: ExecuteService,
  ) {
    super({
      name: 'execute-cronjob',
      onTick: async () => {
        try {
          await this.executeService.execute(SCRT_ASSET_INFO);
        } catch (err) {
          console.error(err);
        }
      },
      cronTime: '*/5 * * * * *',
      start: true,
    });
  }
}
