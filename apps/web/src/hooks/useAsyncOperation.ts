import { useState, useCallback } from 'preact/hooks';

interface UseAsyncOperationOptions {
  trackSuccess?: boolean;      // default: true
  initialLoading?: boolean;    // default: false
  successAutoClearMs?: number; // default: 0 (never)
}

export function useAsyncOperation(options: UseAsyncOperationOptions = {}) {
  const { trackSuccess = true, initialLoading = false, successAutoClearMs = 0 } = options;

  const [error, setErrorState] = useState('');
  const [successMessage, setSuccessState] = useState('');
  const [isLoading, setIsLoading] = useState(initialLoading);

  const setError = useCallback((msg: string) => {
    setErrorState(msg);
    if (msg) setSuccessState('');
  }, []);

  const setSuccess = useCallback((msg: string) => {
    if (!trackSuccess) return;
    setSuccessState(msg);
    if (msg) setErrorState('');
  }, [trackSuccess]);

  const clearMessages = useCallback(() => {
    setErrorState('');
    setSuccessState('');
  }, []);

  const reset = useCallback(() => {
    setErrorState('');
    setSuccessState('');
    setIsLoading(false);
  }, []);

  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    execOptions?: {
      successMessage?: string;
      onSuccess?: (result: T) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<T | undefined> => {
    clearMessages();
    setIsLoading(true);

    try {
      const result = await operation();
      if (execOptions?.successMessage) setSuccess(execOptions.successMessage);
      execOptions?.onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      execOptions?.onError?.(err instanceof Error ? err : new Error(errorMessage));
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [clearMessages, setSuccess, setError]);

  return { error, successMessage, isLoading, setError, setSuccess, clearMessages, execute, reset };
}
