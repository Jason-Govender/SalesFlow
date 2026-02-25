
type AuthEvent = "UNAUTHORIZED";
type Listener = () => void;

const listeners = new Set<Listener>();

export const authEvents = {
  on(event: AuthEvent, listener: Listener) {
    if (event !== "UNAUTHORIZED") return () => {};
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  emit(event: AuthEvent) {
    if (event !== "UNAUTHORIZED") return;
    listeners.forEach((l) => l());
  },
};