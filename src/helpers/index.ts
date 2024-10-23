import {
    SUPPORTED_CHAIN_IDS,
    SUPPORTED_CHAINS_CURRENCY_NAMES,
    SUPPORTED_CHAINS_NAMES
} from "../config";

export const isSupportedChainId = (chainId: number) => SUPPORTED_CHAIN_IDS.includes(chainId);

export const getChainName = (chainId: number) =>
    SUPPORTED_CHAIN_IDS.indexOf(chainId) != -1 ?
        SUPPORTED_CHAINS_NAMES[SUPPORTED_CHAIN_IDS.indexOf(chainId)]
        : "-";

export const getChainCurrencyName = (chainId: number) =>
    SUPPORTED_CHAIN_IDS.indexOf(chainId) != -1 ?
        SUPPORTED_CHAINS_CURRENCY_NAMES[SUPPORTED_CHAIN_IDS.indexOf(chainId)]
        : "-";
