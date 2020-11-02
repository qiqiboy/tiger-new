import { matchRoutes } from 'react-router-config';
import URL from 'url';
import { RouteItem } from './RouteItem.d';

async function prefetchRoutesInitialProps(
    routes: RouteItem[],
    url: string,
    request: any,
    response: any,
    extendProps?: object
) {
    /**
     * 1. 如果组件有loadComponent方法，则调用该方法的返回值替换原来的component配置（支持code splitting异步组件）
     * 2. 如果组件有getIntiialProps方法，则调用该方法获取组件的初始数据
     *      同一级的路由并行处理异步，子路由需要等待上一级异步处理完毕，并接受上级路由的返回值当作参数继续处理异步
     *      最后所有匹配的路由的异步数据返回值merge后统一返回（所以特别注意如果有路由嵌套，异步数据的返回值对象的key不能重复）
     */
    const getInitialRouteData = async (routes: RouteItem[], extraProps?: {}) => {
        const branch = matchRoutes(routes, URL.parse(url).pathname);
        const loaders: Array<Promise<any>> = [];

        for (let i = 0; i < branch.length; i++) {
            const { match, route } = branch[i];

            const loadComponent = route.component?.loadComponent;

            if (loadComponent) {
                const moduleExports = await loadComponent();

                route.component = moduleExports?.default || moduleExports;
            }

            const getInitialProps = route.component?.getInitialProps;

            if (getInitialProps) {
                loaders.push(
                    getInitialProps({
                        ...extendProps,
                        parentInitialProps: extraProps,
                        match,
                        request,
                        response
                    }).then(props => (route.routes ? getInitialRouteData(route.routes, props) : props))
                );
            }
        }

        const results = await Promise.all(loaders);

        return results.reduce((initialProps, result) => {
            if (result) {
                if (result.__error__ instanceof Error) {
                    result.__error__ = result.__error__.message;
                }

                return { ...initialProps, ...result };
            }

            return initialProps;
        }, extraProps);
    };

    const initialProps = await getInitialRouteData(routes);

    return initialProps;
}

export default prefetchRoutesInitialProps;
