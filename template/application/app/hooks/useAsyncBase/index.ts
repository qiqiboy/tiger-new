import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

export interface LoaderState<T> {
    loading: boolean;
    error: any;
    data: T | null;
}

export interface RunAsync<T extends any[]> {
    (...args: T): void;
}

/**
 * @description
 * 用于生成异步请求，其返回值为包含state和runAsync的数组。需要注意的是，该hook需要用户主动执行返回的runAsync方法来调用加载器
 * 其中state为包含loading、error、data三个值的对象，runAsync则为触发本次异步请求，并且其接收的参数会全部传递给loader加载器
 * 你也可以利用第二个参数，它会在请求的开始、结束阶段分别回调这个参数，并且传递state以及你传递给runAsync方法的参数
 *
 * const [state, getUserInfo] = useAsyncBase(userId => http.get('/api/userinfo/' + userId), state => {
 *      if (state.loading) {
 *          Toast.loading(true);
 *      } else if (state.error) {
 *          Toast.show(state.error);
 *      }
 * });
 *
 * 例如用户点击按钮后，再发起这个异步请求
 * const handleClick = () => {
 *      getUserInfo(user.userId);
 * }
 *
 * @params {(...args: any[]) => Promise<any>} loader 异步加载器，例如axios或者fetch请求
 * @params {(state, ...args: any[]) => void} onChange 请求状态变化时的回调
 *
 * @return [{ loading, error, data }, (...args: any[]) => void]
 */
function useAsyncBase<T = any, Args extends any[] = any[]>(
    loader: (...args: Args) => Promise<T>, // 加载器函数
    onChange?: (state: LoaderState<T>, ...args: Args) => void,
    initialLoading: boolean = false
): [LoaderState<T>, RunAsync<Args>] {
    const [loading, setLoading] = useState(initialLoading);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const mountRef = useRef(false);
    const argsRef = useRef<Args>([] as any);
    const state = useMemo(
        () => ({
            loading,
            error,
            data
        }),
        [data, error, loading]
    );

    const runAsync: RunAsync<Args> = useCallback(
        async (...args) => {
            setLoading(true);
            setError(null);
            setData(null);

            argsRef.current = args;

            try {
                const data = await loader(...args);

                setData(data as any);
            } catch (error) {
                setError(error);
            }

            setLoading(false);
        },
        // eslint-disable-next-line
        [loader]
    );

    useEffect(() => {
        if (mountRef.current || initialLoading) {
            if (typeof onChange === 'function') {
                onChange(state, ...argsRef.current);
            }
        }
        // eslint-disable-next-line
    }, [loading]);

    useEffect(() => {
        mountRef.current = true;
        // eslint-disable-next-line
    }, []);

    return [state, runAsync];
}

export default useAsyncBase;
