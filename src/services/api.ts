import axios from 'axios';
import { Address } from 'viem';
import { API_URL } from '../config';

const api = axios.create({
    baseURL: API_URL,
});

export type ProjectResponseDto = {
    id: Address;
    extraTimes: string[];
    removedExtraTimes: string[];
    nextOwner: Address;
    owner: Address;
    packages: string[];
    removedPackages: string[];
    paused: boolean;
    paymentMethods: string[];
    prevOwner: Address;
};

export const getProject = async (chainId: number, id: number): Promise<ProjectResponseDto> => {
    const { data } = await api.get(`/project/${chainId}/${id}`);
    return data;
};
