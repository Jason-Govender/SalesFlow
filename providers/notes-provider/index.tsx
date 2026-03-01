"use client";

import React, {
  useReducer,
  useCallback,
  useMemo,
  useContext,
} from "react";

import {
  NotesStateContext,
  NotesActionContext,
  INITIAL_NOTES_STATE,
} from "./context";

import { NotesReducer } from "./reducer";
import {
  loadNotesPending,
  loadNotesSuccess,
  loadNotesError,
  clearNotesAction,
  actionPendingAction,
  actionSuccessAction,
  actionErrorAction,
} from "./actions";

import { notesService } from "../../utils/notes-service";
import { RelatedToType } from "../../utils/activities-service";
import type { ICreateNoteParams } from "./context";

export const NotesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(
    NotesReducer,
    INITIAL_NOTES_STATE
  );

  const loadNotesByClient = useCallback(async (clientId: string): Promise<void> => {
    dispatch(loadNotesPending());
    try {
      const response = await notesService.listNotes({
        relatedToType: RelatedToType.Client,
        relatedToId: clientId,
      });
      dispatch(loadNotesSuccess({ notes: response.items, clientId, opportunityId: null }));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load notes.";
      dispatch(loadNotesError(message));
    }
  }, []);

  const loadNotesByOpportunity = useCallback(async (opportunityId: string): Promise<void> => {
    dispatch(loadNotesPending());
    try {
      const response = await notesService.listNotes({
        relatedToType: RelatedToType.Opportunity,
        relatedToId: opportunityId,
      });
      dispatch(loadNotesSuccess({ notes: response.items, clientId: null, opportunityId }));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load notes.";
      dispatch(loadNotesError(message));
    }
  }, []);

  const clearNotes = useCallback(() => {
    dispatch(clearNotesAction());
  }, []);

  const createNote = useCallback(
    async (params: ICreateNoteParams) => {
      dispatch(actionPendingAction());
      const relatedToType = params.opportunityId
        ? RelatedToType.Opportunity
        : RelatedToType.Client;
      const relatedToId = params.opportunityId ?? params.clientId ?? "";
      if (!relatedToId) throw new Error("clientId or opportunityId is required");
      try {
        const note = await notesService.createNote({
          content: params.content,
          relatedToType,
          relatedToId,
          isPrivate: params.isPrivate ?? false,
        });
        dispatch(actionSuccessAction());
        if (params.opportunityId && state.currentOpportunityId === params.opportunityId) {
          const response = await notesService.listNotes({
            relatedToType: RelatedToType.Opportunity,
            relatedToId: params.opportunityId,
          });
          dispatch(loadNotesSuccess({ notes: response.items, opportunityId: params.opportunityId }));
        } else if (params.clientId && state.currentClientId === params.clientId) {
          const response = await notesService.listNotes({
            relatedToType: RelatedToType.Client,
            relatedToId: params.clientId,
          });
          dispatch(loadNotesSuccess({ notes: response.items, clientId: params.clientId }));
        }
        return note;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to create note.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.currentClientId, state.currentOpportunityId]
  );

  const updateNote = useCallback(
    async (id: string, params: { content?: string; isPrivate?: boolean }) => {
      dispatch(actionPendingAction());
      try {
        const note = await notesService.updateNote(id, params);
        dispatch(actionSuccessAction());
        if (state.currentOpportunityId) {
          const response = await notesService.listNotes({
            relatedToType: RelatedToType.Opportunity,
            relatedToId: state.currentOpportunityId,
          });
          dispatch(loadNotesSuccess({ notes: response.items, opportunityId: state.currentOpportunityId }));
        } else if (state.currentClientId) {
          const response = await notesService.listNotes({
            relatedToType: RelatedToType.Client,
            relatedToId: state.currentClientId,
          });
          dispatch(loadNotesSuccess({ notes: response.items, clientId: state.currentClientId }));
        }
        return note;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to update note.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.currentClientId, state.currentOpportunityId]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      dispatch(actionPendingAction());
      try {
        await notesService.deleteNote(id);
        dispatch(actionSuccessAction());
        if (state.currentOpportunityId) {
          const response = await notesService.listNotes({
            relatedToType: RelatedToType.Opportunity,
            relatedToId: state.currentOpportunityId,
          });
          dispatch(loadNotesSuccess({ notes: response.items, opportunityId: state.currentOpportunityId }));
        } else if (state.currentClientId) {
          const response = await notesService.listNotes({
            relatedToType: RelatedToType.Client,
            relatedToId: state.currentClientId,
          });
          dispatch(loadNotesSuccess({ notes: response.items, clientId: state.currentClientId }));
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to delete note.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.currentClientId, state.currentOpportunityId]
  );

  const stateValue = useMemo(() => state, [state]);

  const actionValue = useMemo(
    () => ({
      loadNotesByClient,
      loadNotesByOpportunity,
      clearNotes,
      createNote,
      updateNote,
      deleteNote,
    }),
    [
      loadNotesByClient,
      loadNotesByOpportunity,
      clearNotes,
      createNote,
      updateNote,
      deleteNote,
    ]
  );

  return (
    <NotesStateContext.Provider value={stateValue}>
      <NotesActionContext.Provider value={actionValue}>
        {children}
      </NotesActionContext.Provider>
    </NotesStateContext.Provider>
  );
};

export const useNotesState = () => {
  const context = useContext(NotesStateContext);
  if (!context) {
    throw new Error("useNotesState must be used within NotesProvider");
  }
  return context;
};

export const useNotesActions = () => {
  const context = useContext(NotesActionContext);
  if (!context) {
    throw new Error("useNotesActions must be used within NotesProvider");
  }
  return context;
};
