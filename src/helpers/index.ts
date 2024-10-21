import { SUPPORTED_CHAIN_IDS } from "../config";

export const isSupportedChainId = (chainId: number) => SUPPORTED_CHAIN_IDS.includes(chainId);
