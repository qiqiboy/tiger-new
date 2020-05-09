import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import hoistNonReactStatics from 'hoist-non-react-statics';
import type { Request, Response } from 'express';
import { RouteItem } from './RouteItem.d';
import prefetchRoutesInitialProps from './prefetchRoutesInitialProps';

declare global {
    interface Window {
        __DATA__: any;
    }
}

declare module 'react-router' {
    interface StaticContext {
        initialProps?: any;
    }
}

export { RouteItem, prefetchRoutesInitialProps };

export type SSRProps<More> = {
    __error__: Error | undefined;
    __loading__: boolean;
    __getData__(extraProps?: {}): Promise<void>;
} & More;

interface SSRInitialParams extends Partial<Omit<RouteComponentProps, 'match'>> {
    match: RouteComponentProps<any>['match'];
    parentInitialProps?: any;
    request?: Request;
    response?: Response;

    [P: string]: any;
    [P: number]: any;
}

const isEnvBrowser = typeof window !== 'undefined';

let shouldFetchData = isEnvBrowser && !window.__DATA__;
const onHistoryChange = () => {
    shouldFetchData = true;

    window.removeEventListener('popstate', onHistoryChange);
    window.removeEventListener('hashchange', onHistoryChange);
};

if (isEnvBrowser && !shouldFetchData) {
    window.addEventListener('popstate', onHistoryChange);
    window.addEventListener('hashchange', onHistoryChange);
}

function withSSR<SelfProps, More = {}>(
    WrappedComponent: React.ComponentType<SelfProps & SSRProps<More>>,
    getInitialProps: (props: SSRInitialParams) => Promise<More | undefined> | More | undefined
) {
    interface SSRState {
        initialProps?: More;
        loading: boolean;
        error: any;
    }

    class WithSSR extends Component<Omit<SelfProps, keyof SSRProps<More>> & RouteComponentProps, SSRState> {
        static displayName = `WithSSR.${WrappedComponent.displayName || WrappedComponent.name}`;

        constructor(props) {
            super(props);

            if (!shouldFetchData) {
                shouldFetchData = props.history?.action === 'PUSH';
            }

            this.state = {
                initialProps: isEnvBrowser ? (shouldFetchData ? {} : window.__DATA__) : this.SSRInitialData,
                loading: shouldFetchData,
                error:
                    isEnvBrowser &&
                    !shouldFetchData &&
                    window.__DATA__?.__error__ &&
                    new Error(window.__DATA__?.__error__)
            } as SSRState;
        }

        SSRInitialData = this.props.staticContext?.initialProps;

        componentDidMount() {
            if (shouldFetchData) {
                this.getInitialProps();
            }
        }

        getInitialProps = async (extraProps?: {}) => {
            try {
                this.setState({
                    loading: true,
                    error: null
                });

                // @ts-ignore
                const initialProps = await getInitialProps({ ...this.props, ...extraProps });

                this.setState({
                    initialProps
                });
            } catch (error) {
                if (__DEV__) {
                    console.error(error);
                }

                this.setState({
                    error
                });
            }

            this.setState({
                loading: false
            });
        };

        render() {
            if (this.SSRInitialData) {
                // @ts-ignore
                return <WrappedComponent {...this.props} {...this.SSRInitialData} __loading__={false} />;
            }

            const { loading, error, initialProps } = this.state;

            return (
                // @ts-ignore
                <WrappedComponent
                    {...this.props}
                    {...initialProps}
                    __loading__={loading}
                    __error__={error}
                    __getData__={this.getInitialProps}
                />
            );
        }

        static getInitialProps = async (...args) => {
            try {
                // @ts-ignore
                return await getInitialProps(...args);
            } catch (error) {
                // Supress circular reference error in JSON.stringify
                if (error.response) {
                    error.response = {};
                }

                return {
                    __error__: error
                };
            }
        };
    }

    hoistNonReactStatics(WithSSR, WrappedComponent);

    return WithSSR;
}

export default withSSR;
