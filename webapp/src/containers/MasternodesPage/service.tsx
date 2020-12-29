import RpcClient from '../../utils/rpc-client';
import * as log from '../../utils/electronLogger';
import isEmpty from 'lodash/isEmpty';
import {
  CUSTOM_TX_LEDGER,
  DEFAULT_FEE_RATE,
  DEFAULT_MAXIMUM_AMOUNT,
  DEFAULT_MAXIMUM_COUNT, DFI_SYMBOL, FEE_RATE,
  GET_NEW_ADDRESS_TYPE,
  MAXIMUM_AMOUNT,
  MAXIMUM_COUNT,
} from '../../constants';
import { TypeWallet } from '@/typings/entities';
import { construct } from '@/utils/cutxo';
import PersistentStore from '@/utils/persistentStore';
import { ipcRendererFunc } from '@/utils/isElectron';
import { CustomTx } from 'bitcore-lib-dfi';

export const isValidAddress = async (toAddress: string) => {
  const rpcClient = new RpcClient();
  try {
    return rpcClient.isValidAddress(toAddress);
  } catch (err) {
    log.error(`Got error in isValidAddress: ${err}`);
    return false;
  }
};

export const handelFetchMasterNodes = async () => {
  const rpcClient = new RpcClient();
  const masternodes = await rpcClient.listMasterNodes();
  if (isEmpty(masternodes)) {
    return [];
  }
  const transformedData = Object.keys(masternodes).map((item) => ({
    hash: item,
    ...masternodes[item],
  }));

  return transformedData;
};

export const handelCreateMasterNodes = async (typeWallet: TypeWallet) => {
  const rpcClient = new RpcClient();

  const masternodeOwner = await rpcClient.getNewAddress(
    null,
    GET_NEW_ADDRESS_TYPE
  );

  const masternodeOperator = await rpcClient.getNewAddress(
    null,
    GET_NEW_ADDRESS_TYPE
  );
  let masterNodeHash = '';
  if (typeWallet === 'ledger') {
    const cutxo = await construct({
      maximumAmount:
        PersistentStore.get(MAXIMUM_AMOUNT) || DEFAULT_MAXIMUM_AMOUNT,
      maximumCount: PersistentStore.get(MAXIMUM_COUNT) || DEFAULT_MAXIMUM_COUNT,
      feeRate: PersistentStore.get(FEE_RATE) || DEFAULT_FEE_RATE,
    });
    const ipcRenderer = ipcRendererFunc();
    const dataCreateMasternode = {
      txType: CustomTx.customTxType.createMasternode,
      customData: {
        operatorAuthAddress: masternodeOperator,
        operatorType: 0,
        collateralAddress: masternodeOwner,
      },
    };
    const result = await ipcRenderer.sendSync(
      CUSTOM_TX_LEDGER,
      cutxo,
      masternodeOperator,
      0,
      dataCreateMasternode,
      1
    );
    if (result.success) {
      masterNodeHash = await rpcClient.sendRawTransaction(result.data.tx);
    } else {
      throw new Error(result.message);
    }
  } else {
    masterNodeHash = await rpcClient.createMasterNode({
      operatorAuthAddress: masternodeOperator,
      collateralAddress: masternodeOwner,
    });
  }

  return {
    masternodeOperator,
    masternodeOwner,
    masterNodeHash,
  };
};

export const handleResignMasterNode = (masterNodeId) => {
  const rpcClient = new RpcClient();
  return rpcClient.resignMasterNode(masterNodeId);
};

export const getPrivateKey = (address: string) => {
  const rpcClient = new RpcClient();
  return rpcClient.dumpPrivKey(address);
};

export const importPrivateKey = (address: string) => {
  const rpcClient = new RpcClient();
  return rpcClient.importPrivKey(address);
};

export const getAddressInfo = (address) => {
  const rpcClient = new RpcClient();
  return rpcClient.getaddressInfo(address);
};
