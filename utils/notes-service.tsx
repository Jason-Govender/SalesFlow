import { axiosInstance } from "./axios-instance";
import type { AxiosError } from "axios";
import { RelatedToType } from "./activities-service";

export type { RelatedToType };

export interface INote {
  id: string;
  content: string;
  relatedToType?: RelatedToType | number;
  relatedToId?: string;
  isPrivate?: boolean;
  createdAt?: string;
  createdById?: string;
  [key: string]: unknown;
}

export interface IListNotesParams {
  relatedToType?: RelatedToType | number;
  relatedToId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface IPagedNotesResponse {
  items: INote[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages?: number;
}

export interface ICreateNoteRequest {
  content: string;
  relatedToType: RelatedToType | number;
  relatedToId: string;
  isPrivate?: boolean;
}

export interface IUpdateNoteRequest {
  content?: string;
  isPrivate?: boolean;
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

function parsePagedNotesResponse(data: unknown): IPagedNotesResponse {
  if (data && typeof data === "object" && "items" in data) {
    const raw = data as { items: unknown; pageNumber?: number; pageSize?: number; totalCount?: number; totalPages?: number };
    return {
      items: Array.isArray(raw.items) ? (raw.items as INote[]) : [],
      pageNumber: typeof raw.pageNumber === "number" ? raw.pageNumber : 1,
      pageSize: typeof raw.pageSize === "number" ? raw.pageSize : 10,
      totalCount: typeof raw.totalCount === "number" ? raw.totalCount : 0,
      totalPages: typeof raw.totalPages === "number" ? raw.totalPages : undefined,
    };
  }
  if (Array.isArray(data)) {
    return { items: data as INote[], pageNumber: 1, pageSize: data.length, totalCount: data.length };
  }
  return { items: [], pageNumber: 1, pageSize: 10, totalCount: 0 };
}

export const notesService = {
  async listNotes(params: IListNotesParams): Promise<IPagedNotesResponse> {
    try {
      const response = await axiosInstance.get<unknown>("/api/notes", {
        params: {
          relatedToType: params.relatedToType,
          relatedToId: params.relatedToId,
          pageNumber: params.pageNumber,
          pageSize: params.pageSize,
        },
      });
      return parsePagedNotesResponse(response.data);
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return { items: [], pageNumber: 1, pageSize: 10, totalCount: 0 };
      }
      const message = extractErrorMessage(error, "Failed to load notes.");
      throw new Error(message);
    }
  },

  async getNote(id: string): Promise<INote> {
    try {
      const response = await axiosInstance.get<INote>(`/api/notes/${id}`);
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to load note.");
      throw new Error(message);
    }
  },

  async createNote(body: ICreateNoteRequest): Promise<INote> {
    try {
      const response = await axiosInstance.post<INote>("/api/notes", {
        content: body.content,
        relatedToType: body.relatedToType,
        relatedToId: body.relatedToId,
        isPrivate: body.isPrivate ?? false,
      });
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to create note.");
      throw new Error(message);
    }
  },

  async updateNote(id: string, body: IUpdateNoteRequest): Promise<INote> {
    try {
      const response = await axiosInstance.put<INote>(`/api/notes/${id}`, body);
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to update note.");
      throw new Error(message);
    }
  },

  async deleteNote(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/notes/${id}`);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to delete note.");
      throw new Error(message);
    }
  },
};
