import {AssetInfo, OracleAddress, PredictionAddress} from '../types';
import {getAssetKey} from '../utils';

export const PRICE_FEED_API: string = 'http://sefi.exchange/apps/pp/feed.json';
export const SCRT_USD_KEY: string = 'SCRT/USDT';
export const SEFI_USD_KEY: string = 'SEFI/USDT';

export const SCRT_ASSET_INFO: AssetInfo = {
  native_token: {
    denom: 'uscrt',
  },
};

export const PREDICTION_ADDRESS: PredictionAddress = {
  'polar-2': {
    [getAssetKey(SCRT_ASSET_INFO)]:
      'secret1aaxgtpzv8a3pdkznmwkyh4w99uylj4x4232lg7',
  },
};

export const ORACLE_ADDRESS: OracleAddress = {
  'polar-2': 'secret19hd5ywtp9uqczw8e40vq0psgn9zefey02n806e',
};
