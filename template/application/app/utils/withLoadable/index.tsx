import { Component, createElement, lazy, Suspense } from 'react';
import ErrorBox from 'components/ErrorBox';
import Loading from 'components/Loading';

class ErrorBoundary extends Component<
    {
        children: React.ReactNode;
    },
    {
        error: any;
    }
> {
    static getDerivedStateFromError(error) {
        return { error };
    }

    state = {
        error: null
    };

    render() {
        if (this.state.error) {
            return <ErrorBox error={this.state.error} />;
        }

        return this.props.children;
    }
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
function withLoadable<P = {}>(loader, exportName = 'default') {
    const component = lazy(() =>
        loader().then(module => ({
            get default() {
                return module[exportName];
            }
        }))
    );

    const AsyncComponent: React.FC<P> = props => {
        return (
            <ErrorBoundary>
                <Suspense fallback={<Loading tip={__('请稍等...')} />}>
                    {createElement(component, props)}
                </Suspense>
            </ErrorBoundary>
        );
    };

    return AsyncComponent;
}

export default withLoadable;
