// src/api/transactionAPI.ts
import apiClient from './api';

export interface TransactionData {
    id?: number;
    type: string,
    category: string;
    amount: number;
    description: string;
    transactionDate: string;
}

export interface ApiTransaction {
    id: number;
    type: 'EXPENSE' | 'INCOME';
    category: string;
    amount: number;
    description: string;
    transactionDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface TransactionResponse {
    content: ApiTransaction[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export const transactionAPI = {
    create: (data: TransactionData) => apiClient.post('/transactions', data),
    getAll: (page = 0, size = 20): Promise<TransactionResponse> =>
        apiClient.get(`/transactions?page=${page}&size=${size}`),
};
