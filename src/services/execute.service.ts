import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import 'dotenv/config';
import {CosmWasmClient} from 'secretjs';
import {PREDICTION_ADDRESS} from '../constants';
import {Round, State} from '../models';
import {RoundRepository, StateRepository} from '../repositories';
import {AssetInfo} from '../types';
import {
  getAssetContract,
  getAssetKey,
  getSigner,
  isNativeToken,
} from '../utils';

@injectable({scope: BindingScope.TRANSIENT})
export class ExecuteService {
  private network: string;
  private locked: boolean;

  constructor(
    @repository(StateRepository)
    private stateRepository: StateRepository,
    @repository(RoundRepository)
    private roundRepository: RoundRepository,
  ) {
    if (process.env.NETWORK && PREDICTION_ADDRESS[process.env.NETWORK]) {
      this.network = process.env.NETWORK;
    } else {
      throw Error('No network env or invalid network');
    }
    this.locked = false;
  }

  /*
   * Add service methods here
   */
  public async execute(asset: AssetInfo) {
    if (this.locked) {
      return;
    }
    this.locked = true;

    try {
      const contractAddr = PREDICTION_ADDRESS[this.network][getAssetKey(asset)];
      const signer = await getSigner(false);

      const state = await signer.queryContractSmart(contractAddr, {
        state: {},
      });
      let localState = await this.stateRepository.findOne({
        where: {
          asset: getAssetContract(asset),
        },
      });
      if (!localState) {
        localState = new State();
        localState.asset = getAssetContract(asset);
        localState.isNative = isNativeToken(asset);
        localState.paused = false;
        localState.epoch = 0;

        localState = await this.stateRepository.create(localState);
      }

      const currentEpoch = Number(state.epoch);
      if (localState.epoch < currentEpoch) {
        await this.syncRoundInfo(signer, asset, localState.epoch, currentEpoch);
        localState.epoch = currentEpoch;
        await this.stateRepository.save(localState);
      }

      if (state.paused) {
        if (localState.paused) {
          localState.paused = true;
          await this.stateRepository.save(localState);
        }
      } else {
        const lastRound = await this.roundRepository.findOne({
          where: {
            roundId: currentEpoch,
            asset: getAssetContract(asset),
            isNative: isNativeToken(asset),
          },
        });
        if (lastRound && Date.now() / 1000 >= lastRound.lockTime) {
          do {
            try {
              const tx = await signer.execute(contractAddr, {
                execute_round: {},
              });

              console.log(
                `Executed round #${lastRound.roundId} for ${getAssetKey(
                  asset,
                )} prediction`,
              );
              console.log(tx);

              await this.syncRoundInfo(
                signer,
                asset,
                currentEpoch - 1,
                currentEpoch + 1,
              );

              localState.epoch += 1;
              await this.stateRepository.save(localState);

              break;
            } catch (err) {}
          } while (true);
        }
      }
    } catch (err) {
    } finally {
      this.locked = false;
    }
  }

  private async syncRoundInfo(
    client: CosmWasmClient,
    asset: AssetInfo,
    roundIdStart: number,
    roundIdEnd: number,
  ) {
    try {
      const contractAddr = PREDICTION_ADDRESS[this.network][getAssetKey(asset)];
      for (
        let roundId = roundIdStart > 0 ? roundIdStart : 1;
        roundId <= roundIdEnd;
        roundId += 1
      ) {
        const round = await client.queryContractSmart(contractAddr, {
          round: {
            epoch: roundId.toString(),
          },
        });
        let localRound = await this.roundRepository.findOne({
          where: {
            roundId,
            asset: getAssetContract(asset),
            isNative: isNativeToken(asset),
          },
        });
        if (!localRound) {
          localRound = new Round();
          localRound.asset = getAssetContract(asset);
          localRound.isNative = isNativeToken(asset);
          localRound.roundId = roundId;
          if (round.open_price) {
            localRound.openPrice = Number(round.open_price);
          }
          if (round.close_price) {
            localRound.closePrice = Number(round.close_price);
          }
          localRound.startTime = round.start_time;
          localRound.lockTime = round.lock_time;
          localRound.endTime = round.end_time;
          localRound.upBetAmount = round.up_amount;
          localRound.downBetAmount = round.down_amount;

          await this.roundRepository.create(localRound);
        } else {
          if (round.open_price) {
            localRound.openPrice = Number(round.open_price);
          }
          if (round.close_price) {
            localRound.closePrice = Number(round.close_price);
          }
          localRound.startTime = round.start_time;
          localRound.lockTime = round.lock_time;
          localRound.endTime = round.end_time;
          localRound.upBetAmount = round.up_amount;
          localRound.downBetAmount = round.down_amount;

          await this.roundRepository.save(localRound);
        }
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
