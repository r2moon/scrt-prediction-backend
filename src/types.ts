export type Denom = {
  denom: string;
};

export type NativeToken = {
  native_token: Denom;
};

export type Token = {
  contract_addr: string;
  token_code_hash: string;
  viewing_key: string;
};

export type Snip20Token = {
  token: Token;
};

export type AssetInfo = NativeToken | Snip20Token;

export type PredictionAddress = Record<string, Record<string, string>>;

export type OracleAddress = Record<string, string>;
