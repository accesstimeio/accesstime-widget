import { Address, parseAbi } from "viem";

export const SUPPORTED_CHAIN_IDS = [8453, 84532]; // base, baseSepolia

export const FACTORY_ADDRESS: Address = "0x84Ec87B41272223755AdD5f2A8271290aD5d87f0";

export const FACTORY_ABI = parseAbi([
    'function deploymentDetails(address accessTime) view returns (bool status,uint256 id,bool includedExtraTime,bool includedPackageModule,string name,string description,string website)',
]);

export const ACCESTIME_ABI = parseAbi([
    'function purchase(uint256 amount,address paymentToken)',
    'function purchasePackage(uint256 amount,address paymentToken,uint256 packageID)',
]);

export const API_URL = "https://api.accesstime.io";
