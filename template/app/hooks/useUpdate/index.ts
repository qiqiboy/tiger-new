import { useEffect } from 'react';
import useMount from 'hooks/useMount';

/**
 * @description
 * 类似componentDidUpdate生命周期, 用法类似useEffect，并且支持返回清理函数
 *
 * 每次组件更新都触发
 * useUpdate(() => console.log('didUpdate'));
 *
 * 当userId变化时触发
 * useUpdate(() => console.log('didUpdate'), [useId]);
 *
 * 返回清理函数
 * useUpdate(() => {
 *      console.log('didUpdate');
 *
 *      return () => {
 *          console.log('clear')
 *      }
 * }, [useId]);
 */
function useUpdate(callback: React.EffectCallback, dependencies?: any[]) {
    const isMount = useMount();

    useEffect(() => {
        if (isMount) {
            return callback && callback();
        }
        // eslint-disable-next-line
    }, dependencies);
}

export default useUpdate;
