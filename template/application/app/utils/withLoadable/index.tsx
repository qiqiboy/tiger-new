import React, { Component } from 'react';
import loadable from '@loadable/component';
import Loading from 'components/Loading';
import ErrorBox from 'components/ErrorBox';

interface LoadableState {
    error: any;
}

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
function withLoadable<LoadableProps = any>(loader, name = 'default'): React.ComponentClass<LoadableProps> {
    const LoadableComponent = loadable(loader, {
        resolveComponent: moduleExports => moduleExports[name],
        fallback: <Loading className="loadable--loading" />
    });

    class ReactLoadable extends Component<LoadableProps, LoadableState> {
        readonly state = {} as LoadableState;

        public componentDidCatch(error: Error) {
            this.setState({
                error
            });
        }

        render() {
            const { error } = this.state;

            return error ? (
                <ErrorBox
                    error={error}
                    onClick={() => LoadableComponent.load().then(() => this.setState({ error: null }))}
                />
            ) : (
                <LoadableComponent />
            );
        }
    }

    // @ts-ignore for ssr preload
    ReactLoadable.loadComponent = () => loader().then(moduleExports => moduleExports[name]);

    return ReactLoadable;
}

export default withLoadable;
