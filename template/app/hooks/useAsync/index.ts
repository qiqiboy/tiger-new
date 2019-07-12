import { useEffect } from 'react';
import useAsyncBase, { LoaderState, RunAsync } from 'hooks/useAsyncBase';
import Toast from 'components/Toast';

interface UseAsync<T = any> {
    (loader: () => Promise<T>, toast?: boolean | string): [LoaderState<T>, RunAsync<never[]>];
}

/**
 * @description
 * 基于useAsyncBase，它会主动在组件mount时调用loader。
 *
 * 请注意，useAsync不接受需要传递参数的loader！
 *
 * 用法一
 * const [state, getData] = useAsync(() => http.get(...));
 *
 * 用法二
 * 第二个参数传递true或者字符串，会主动使用Toast显示加载中状态
 * const [state, getData] = useAsync(() => http.get(...), 'loading...');
 */
const useAsync: UseAsync = (loader, toast) => {
    const ret = useAsyncBase(
        loader,
        state => {
            const showToast = !!toast || typeof toast === 'string';

            if (showToast) {
                Toast.loading(state.loading, typeof toast === 'string' ? toast : undefined);
            }
        },
        true
    );

    useEffect(() => {
        ret[1]();
        // eslint-disable-next-line
    }, []);

    return ret;
};

export default useAsync;
