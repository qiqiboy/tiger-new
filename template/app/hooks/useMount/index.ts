import { useState, useEffect, useLayoutEffect } from 'react';

/**
 * @description
 * 类似componentDidMount生命周期，用法类似useEffect，并且支持返回清理函数
 *
 * 另外其返回一个布尔值，表示组件是否已isMount
 *
 * 用法一，组件挂载后执行回调
 * useMount(() => console.log('mount'));
 *
 * 用法二，获取组件是否mount的标识符，可以用来在异步回调中判断组件的挂载状态
 * const isMount = useMount();
 *
 * useEffect(() => {
 *      if (isMount) {
 *          ...
 *      }
 *  });
 */
function useMount(callback?: React.EffectCallback) {
    const [isMount, setMount] = useState(false);

    useLayoutEffect(() => {
        setMount(true);

        return () => setMount(false);
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        return callback && callback();
        // eslint-disable-next-line
    }, []);

    return isMount;
}

export default useMount;
