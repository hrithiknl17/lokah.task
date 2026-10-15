import {
  type Dispatch,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import type { AppState } from '../types';
import { type Action, reducer } from './reducer';
import { clearState, loadState, saveState } from './storage';

export type StorageNotice = 'recovered' | 'saveFailed' | null;

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
  notice: StorageNotice;
  dismissNotice: () => void;
  resetDemo: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // Load once, synchronously, so the first render already has saved progress.
  const initial = useRef<ReturnType<typeof loadState> | null>(null);
  if (initial.current === null) initial.current = loadState();

  const [state, dispatch] = useReducer(reducer, initial.current.state);
  const [notice, setNotice] = useState<StorageNotice>(
    initial.current.recovered ? 'recovered' : null,
  );

  useEffect(() => {
    if (!saveState(state)) setNotice('saveFailed');
  }, [state]);

  const dismissNotice = useCallback(() => setNotice(null), []);

  const resetDemo = useCallback(() => {
    clearState();
    dispatch({ type: 'RESET' });
    setNotice(null);
  }, []);

  const value = useMemo(
    () => ({ state, dispatch, notice, dismissNotice, resetDemo }),
    [state, notice, dismissNotice, resetDemo],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useAppState must be used inside <AppProvider>');
  return value;
}

export function nowIso(): string {
  return new Date().toISOString();
}
