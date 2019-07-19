import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'components/Loading';
import ErrorBox from 'components/ErrorBox';
import './style.scss';

/**
 * @description
 * 高阶组件，用于组件按需加载
 *
 * 加载单个组件文件，即组件默认导出
 * const AsyncComponent = withLoadable(() => import('xxx'));
 *
 * 如果一个文件中包含了多个组件，则可以传递第二个参数致命要渲染哪个组件
 * const AsyncComponent = withLoadable(() => import('xxx'), 'exportName');
 */
function withLoadable(loader, name = 'default') {
    return Loadable({
        loader,
        loading: ({ error, retry }) =>
            error ? <ErrorBox error={error} onClick={retry} /> : <Loading className="loadable--loading" />,
        render(loaded, props) {
            if (!loaded[name]) {
                return <ErrorBox error={new Error(`未找到 “${name}” 对应的组件！`)} />;
            }

            return React.createElement(loaded[name], props);
        }
    });
}

export default withLoadable;

