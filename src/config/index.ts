import { Address, parseAbi } from "viem";

export const SUPPORTED_CHAIN_IDS = [8453, 84532]; // base, baseSepolia
export const SUPPORTED_CHAINS_NAMES = ["Base", "Base Sepolia"]; // base, baseSepolia
export const SUPPORTED_CHAINS_CURRENCY_NAMES = ["ETH", "ETH"]; // base, baseSepolia

export const FACTORY_ADDRESS: Address = "0x84Ec87B41272223755AdD5f2A8271290aD5d87f0";

export const FACTORY_ABI = parseAbi([
    'function deploymentDetails(address accessTime) view returns (bool status,uint256 id,bool includedExtraTime,bool includedPackageModule,string name,string description,string website)',
]);

export const ACCESTIME_ABI = parseAbi([
    'function purchase(uint256 amount,address paymentToken)',
    'function purchasePackage(uint256 amount,address paymentToken,uint256 packageID)',
    'function packages(uint256 packageId) view returns (uint256 unixTime,bool exist)',
    'function tokenRates(address paymentToken) view returns (uint256 rate)',
    'function extras(uint256 extraId) view returns (uint256 unixTime,uint256 percent,bool exist)'
]);

export const API_URL = "https://api.accesstime.io";

export const ZERO_AMOUNT = BigInt("0");
