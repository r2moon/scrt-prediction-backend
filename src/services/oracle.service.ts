import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import axios from 'axios';
import 'dotenv/config';
import {
  ORACLE_ADDRESS,
  PRICE_FEED_API,
  SCRT_ASSET_INFO,
  SCRT_USD_KEY,
} from '../constants';
import {getSigner} from '../utils';

@injectable({scope: BindingScope.TRANSIENT})
export class OracleService {
  constructor(/* Add @inject to inject parameters */) {}

  /*
   * Add service methods here
   */
  public async updatePrice() {
    let offchainPrices: Record<string, Record<string, number>> | undefined =
      undefined;

    try {
      const res = await axios.get(PRICE_FEED_API);
      offchainPrices = res.data;
    } catch (err) {
      console.log('Price Update failed');
      console.error(err);
      return;
    }

    if (
      !offchainPrices ||
      !offchainPrices[SCRT_USD_KEY] ||
      !offchainPrices[SCRT_USD_KEY].price
    ) {
      console.log('SCRT/USD price not exist');
      return;
    }

    const signer = await getSigner(true);

    try {
      await signer.execute(ORACLE_ADDRESS[process.env.NETWORK ?? ''], {
        feed_price: {
          prices: [
            [SCRT_ASSET_INFO, offchainPrices[SCRT_USD_KEY].price.toString()],
          ],
        },
      });
      console.log('Price updated');
    } catch (err) {
      console.error('Price update failed');
    }
  }
}
