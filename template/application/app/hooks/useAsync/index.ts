import { useEffect } from 'react';
import useAsyncBase, { LoaderState, RunAsync } from 'hooks/useAsyncBase';
import Toast from 'components/Toast';

type OnChangeOrToast<T> = boolean | string | ((state: LoaderState<T>) => void);

interface UseAsync<T = any> {
    (loader: () => Promise<T>, ...args: Array<OnChangeOrToast<T>>): [LoaderState<T>, RunAsync<never[]>];
}

/**
 * @description
 * 基于useAsyncBase，它会主动在组件mount时调用loader。
 *
 * 请注意，useAsync不接受需要传递参数的loader！这是因为这个请求需要在组件首次mount时自动触发，所以如果需要参数，请在loader加载器中调用。
 *
 * 用法一
 * const [state, getData] = useAsync(() => http.get(...));
 *
 * 用法二
 * 第二个参数传递true或者字符串，会主动使用Toast显示加载中状态
 * const [state, getData] = useAsync(() => http.get(...), 'loading...');
 *
 * 用法三
 * 第二个参数你还可以传递一个回调，它将在请求的前后阶段分别触发(同useAsyncBase的第二个参数)
 * useAsync(() => http.get(...), state => {
 *      if (state.error) {
 *          alert(error.message);
 *      }
 *
 *      if (state.loading) {
 *          Toast.loading(true);
 *      } else {
 *          Toast.loading(false);
 *      }
 * });
 *
 * 用法四
 * 事实上，useAsync的第二个参数和第三个参数意义是相同的，如果你即想展示Toast的loading，又想额外做其它处理(比如直接弹窗显示错误)，可以这样：
 * useAsync(() => http.get(...), 'loading...', state => {
 *      if (state.error) {
 *          alert(error.message);
 *      }
 * });
 * 换个顺序也是OK的：
 * useAsync(() => http.get(...), state => {
 *      if (state.error) {
 *          alert(error.message);
 *      }
 * }, 'loading...');
 */
const useAsync: UseAsync = (loader, ...changeOrToasts) => {
    const ret = useAsyncBase(
        loader,
        state => {
            let [toast, onChange] = changeOrToasts;

            if (typeof toast === 'function') {
                [onChange, toast] = [toast, onChange];
            }

            if (typeof onChange === 'function') {
                onChange(state);
            }

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
