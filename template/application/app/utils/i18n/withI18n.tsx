import React, { Component } from 'react';
import i18n, { context } from '.';

export interface I18nProps {
    i18n: typeof i18n;
}

function withI18n<SelfProps>(WrappedComponent: React.ComponentType<SelfProps & I18nProps>) {
    class WithI18n extends Component<Omit<SelfProps, keyof I18nProps>> {
        static displayName = `WithI18n.${WrappedComponent.displayName || WrappedComponent.name}`;

        render() {
            return (
                <context.Consumer>
                    {props => <WrappedComponent {...(this.props as any)} i18n={props} />}
                </context.Consumer>
            );
        }
    }

    return WithI18n;
}

export default withI18n;
