import 'dotenv/config';
import {
  encodeSecp256k1Pubkey,
  EnigmaUtils,
  pubkeyToAddress,
  Secp256k1Pen,
  SigningCosmWasmClient,
} from 'secretjs';
import {AssetInfo, NativeToken, Snip20Token} from './types';

export const getAssetKey = (asset: AssetInfo) => {
  if ((asset as Snip20Token).token) {
    return `snip20Token_${(asset as Snip20Token).token.contract_addr}`;
  } else if ((asset as NativeToken).native_token) {
    return `nativeToken_${(asset as NativeToken).native_token.denom}`;
  }
  throw Error('Not supported asset');
};

export const getAssetContract = (asset: AssetInfo) => {
  if ((asset as Snip20Token).token) {
    return (asset as Snip20Token).token.contract_addr;
  } else if ((asset as NativeToken).native_token) {
    return (asset as NativeToken).native_token.denom;
  }
  throw Error('Not supported asset');
};

export const isNativeToken = (asset: AssetInfo) => {
  return !!(asset as NativeToken).native_token;
};

export const getSigner = async (
  forOracle: boolean,
): Promise<SigningCosmWasmClient> => {
  const mnemonic = forOracle
    ? process.env.FEEDER_MNEMONIC
    : process.env.OPERATOR_MNEMONCI;
  if (!mnemonic) {
    throw Error('No Mnemonic');
  }
  const signingPen = await Secp256k1Pen.fromMnemonic(mnemonic);

  const pubkey = encodeSecp256k1Pubkey(signingPen.pubkey);

  const accAddress = pubkeyToAddress(pubkey, 'secret');

  const txEncryptionSeed = EnigmaUtils.GenerateNewSeed();

  const client = new SigningCosmWasmClient(
    process.env.SECRET_REST_URL ?? '',
    accAddress,
    signBytes => signingPen.sign(signBytes),
    txEncryptionSeed,
    // customFees
  );

  return client;
};
