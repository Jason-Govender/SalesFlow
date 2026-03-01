import { axiosInstance } from "./axios-instance";
import type { AxiosError } from "axios";

/** DocumentCategory: 1 Contract, 2 Proposal, 3 Presentation, 4 Quote, 5 Report, 6 Other */
export enum DocumentCategory {
  Contract = 1,
  Proposal = 2,
  Presentation = 3,
  Quote = 4,
  Report = 5,
  Other = 6,
}

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  [DocumentCategory.Contract]: "Contract",
  [DocumentCategory.Proposal]: "Proposal",
  [DocumentCategory.Presentation]: "Presentation",
  [DocumentCategory.Quote]: "Quote",
  [DocumentCategory.Report]: "Report",
  [DocumentCategory.Other]: "Other",
};

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB

export interface IDocument {
  id: string;
  fileName: string;
  description?: string;
  documentCategory?: DocumentCategory | number;
  relatedToType?: number;
  relatedToId?: string;
  uploadedAt?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface IUploadDocumentParams {
  file: File;
  relatedToType: number;
  relatedToId: string;
  description?: string;
  documentCategory?: number;
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

function parsePagedResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "items" in data && Array.isArray((data as { items: unknown }).items)) {
    return (data as { items: T[] }).items;
  }
  return [];
}

export const documentsService = {
  async getDocumentsByClient(clientId: string): Promise<IDocument[]> {
    try {
      const response = await axiosInstance.get<unknown>("/api/documents", {
        params: { relatedToType: 1, relatedToId: clientId },
      });
      return parsePagedResponse<IDocument>(response.data);
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      const message = extractErrorMessage(error, "Failed to load documents.");
      throw new Error(message);
    }
  },

  async getDocument(id: string): Promise<IDocument> {
    try {
      const response = await axiosInstance.get<IDocument>(`/api/documents/${id}`);
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to load document.");
      throw new Error(message);
    }
  },

  async uploadDocument(params: IUploadDocumentParams): Promise<IDocument> {
    const formData = new FormData();
    formData.append("file", params.file);
    formData.append("relatedToType", String(params.relatedToType));
    formData.append("relatedToId", params.relatedToId);
    if (params.description != null && params.description !== "") {
      formData.append("description", params.description);
    }
    if (params.documentCategory != null) {
      formData.append("documentCategory", String(params.documentCategory));
    }

    try {
      const response = await axiosInstance.post<IDocument>(
        "/api/documents/upload",
        formData,
        {
          transformRequest: [
            (data, headers) => {
              if (headers && data instanceof FormData) {
                delete headers["Content-Type"];
              }
              return data;
            },
          ],
        }
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to upload document.");
      throw new Error(message);
    }
  },

  async downloadDocument(id: string): Promise<{ blob: Blob; fileName?: string }> {
    try {
      const response = await axiosInstance.get<Blob>(
        `/api/documents/${id}/download`,
        { responseType: "blob" }
      );
      const blob = response.data;
      let fileName: string | undefined;
      const disposition = response.headers["content-disposition"];
      if (typeof disposition === "string" && disposition.includes("filename=")) {
        const match = disposition.match(/filename[*]?=(?:UTF-8'')?["']?([^"'\s;]+)["']?/i);
        if (match?.[1]) fileName = decodeURIComponent(match[1].replace(/\\"/g, '"'));
      }
      return { blob, fileName };
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to download document.");
      throw new Error(message);
    }
  },

  async deleteDocument(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/documents/${id}`);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to delete document.");
      throw new Error(message);
    }
  },
};
