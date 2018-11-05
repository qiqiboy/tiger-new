import React, { Component } from 'react';
import http from 'utils/http';
import Loading from 'components/Loading';
import ErrorBox from 'components/ErrorBox';
import './style.scss';

interface IInjected {
    loadData: any;
}

export default function createWithPreload(config: object) {
    return function withPreload<Self = {}>(
        WrappedComponent: React.ComponentType<Self & IInjected>
    ): React.ComponentClass<Self> {
        return class extends Component<Self> {
            static displayName = 'WithPreload-' + (WrappedComponent.displayName || WrappedComponent.name);

            state = {
                loading: true,
                error: null,
                data: null
            };

            componentDidMount() {
                this.getData();
            }

            getData = async () => {
                this.setState({
                    loading: true,
                    error: null
                });

                try {
                    const data = await http(config);

                    this.setState({
                        data
                    });
                } catch (error) {
                    this.setState({
                        error
                    });
                }

                this.setState({
                    loading: false
                });
            };

            render() {
                const { loading, error, data } = this.state;

                if (loading) {
                    return <Loading className="with-preload-loading" />;
                }

                if (error) {
                    return <ErrorBox error={error} onClick={this.getData} />;
                }

                return <WrappedComponent {...this.props} loadData={data} />;
            }
        };
    };
}
