import { axiosInstance } from "./axios-instance";
import type { AxiosError } from "axios";

export interface IContact {
  id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  position?: string;
  isPrimaryContact?: boolean;
  [key: string]: unknown;
}

export interface ICreateContactRequest {
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  position?: string;
  isPrimaryContact?: boolean;
}

export interface IUpdateContactRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  position?: string;
  isPrimaryContact?: boolean;
}

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "string") return error;

  const axiosError = error as AxiosError<{ message?: string; error?: string }>;
  const data = axiosError?.response?.data;

  if (data?.message && typeof data.message === "string") {
    return data.message;
  }

  if (data?.error && typeof data.error === "string") {
    return data.error;
  }

  if (isAxiosError(error) && error.code === "ERR_NETWORK" && !error.response) {
    return "Cannot reach the API. Check that the API is running and NEXT_PUBLIC_API_BASE_URL points to it.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const isAxiosError = (error: unknown): error is AxiosError => {
  if (!error || typeof error !== "object") return false;
  return "isAxiosError" in error;
};

export const contactsService = {
  async getContactsByClient(clientId: string): Promise<IContact[]> {
    try {
      const response = await axiosInstance.get<IContact[]>(
        `/api/contacts/by-client/${clientId}`
      );
      const data = response.data;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to load contacts."
      );
      throw new Error(message);
    }
  },

  async getContact(id: string): Promise<IContact> {
    try {
      const response = await axiosInstance.get<IContact>(
        `/api/contacts/${id}`
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to load contact.");
      throw new Error(message);
    }
  },

  async createContact(body: ICreateContactRequest): Promise<IContact> {
    try {
      const response = await axiosInstance.post<IContact>(
        "/api/contacts",
        body
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to create contact.");
      throw new Error(message);
    }
  },

  async updateContact(
    id: string,
    body: IUpdateContactRequest
  ): Promise<IContact> {
    try {
      const response = await axiosInstance.put<IContact>(
        `/api/contacts/${id}`,
        body
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to update contact.");
      throw new Error(message);
    }
  },

  async setPrimaryContact(id: string): Promise<void> {
    try {
      await axiosInstance.put(`/api/contacts/${id}/set-primary`);
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to set primary contact."
      );
      throw new Error(message);
    }
  },

  async deleteContact(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/contacts/${id}`);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to delete contact.");
      throw new Error(message);
    }
  },
};
