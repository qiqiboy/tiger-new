import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Request, Response } from 'express';

declare global {
    interface Window {
        __DATA__: any;
    }
}

export type SSRProps<More> = {
    __error__: Error | undefined;
    __loading__: boolean;
    __getData__(props: any): Promise<void>;
} & More;

export interface SSRinitialParams extends Partial<RouteComponentProps<any>> {
    request?: Request;
    response?: Response;
}

let routerChanged = typeof window === 'undefined' || !window.__DATA__ || !!window.__DATA__.__error__;
const onHistoryChange = () => {
    routerChanged = true;

    window.removeEventListener('popstate', onHistoryChange);
    window.removeEventListener('hashchange', onHistoryChange);
};

if (!routerChanged && typeof window !== 'undefined') {
    window.addEventListener('popstate', onHistoryChange);
    window.addEventListener('hashchange', onHistoryChange);
}

function withSSR<SelfProps, More = {}>(
    WrappedComponent: React.ComponentType<SelfProps & SSRProps<More>>,
    getInitialProps: (props: SSRinitialParams) => Promise<More>
) {
    interface SSRState {
        initialProps: More;
        loading: boolean;
        error: any;
    }

    class WithSSR extends Component<Omit<SelfProps, keyof SSRProps<More>>, SSRState> {
        static displayName = `WithSSR.${WrappedComponent.displayName || WrappedComponent.name}`;

        constructor(props) {
            super(props);

            let initialProps = WithSSR.SSRInitialData;

            if (!routerChanged) {
                routerChanged = props.history?.action === 'PUSH';
            }

            this.state = {
                initialProps,
                loading: routerChanged
            } as SSRState;
        }

        componentDidMount() {
            if (routerChanged) {
                this.getInitialProps();
            }
        }

        getInitialProps = async () => {
            try {
                this.setState({
                    loading: true
                });

                // @ts-ignore
                const initialProps = await getInitialProps(this.props);

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
            if (WithSSR.SSRInitialData) {
                // @ts-ignore
                return <WrappedComponent {...this.props} {...WithSSR.SSRInitialData} __loading__={false} />;
            }

            const { loading, error, initialProps } = this.state;

            return (
                // @ts-ignore
                <WrappedComponent
                    {...this.props}
                    {...(routerChanged ? {} : window.__DATA__)}
                    {...initialProps}
                    __loading__={loading}
                    __error__={error}
                    __getData__={this.getInitialProps}
                />
            );
        }

        static SSRInitialData: any;
        static getInitialProps = async (...args) => {
            try {
                // @ts-ignore
                const initialProps = await getInitialProps(...args);

                WithSSR.SSRInitialData = initialProps;
            } catch (error) {
                WithSSR.SSRInitialData = {
                    __error__: error
                };
            }

            return WithSSR.SSRInitialData;
        };
    }

    return WithSSR;
}

export default withSSR;
