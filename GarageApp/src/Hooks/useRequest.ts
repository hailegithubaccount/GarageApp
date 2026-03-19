import { useState, useCallback } from 'react';

interface RequestState<T> {
    response: T | null;
    error: any;
    loading: boolean;
    isSuccess: boolean;
    isError: boolean;
}

const useRequest = <T = any>() => {
    const [state, setState] = useState<RequestState<T>>({
        response: null,
        error: null,
        loading: false,
        isSuccess: false,
        isError: false,
    });

    const doRequest = useCallback(async (promise: Promise<T>) => {
        setState((s) => ({ ...s, loading: true, isSuccess: false, isError: false }));
        try {
            const result = await promise;
            setState({
                response: result,
                error: null,
                loading: false,
                isSuccess: true,
                isError: false,
            });
            return result;
        } catch (err: any) {
            setState({
                response: null,
                error: err,
                loading: false,
                isSuccess: false,
                isError: true,
            });
            throw err;
        }
    }, []);

    return {
        ...state,
        doRequest,
    };
};

export default useRequest;
