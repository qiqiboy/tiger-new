import { Component } from 'react';
import { createPortal } from 'react-dom';
import './style.scss';

export interface PortalProps {
    className?: string;
    children: React.ReactNode;
}

class Portal extends Component<PortalProps> {
    container: Element;

    componentWillUnmount() {
        Portal.instancesNumber--;

        document.body.removeChild(this.container);

        if (Portal.instancesNumber <= 0) {
            document.body.classList.remove('portal-opened');

            Portal.instancesNumber = 0;
        }
    }

    public componentDidMount() {
        Portal.instancesNumber++;

        document.body.classList.add('portal-opened');
        document.body.appendChild(this.container);
    }

    render() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = this.props.className || '';
        }

        return createPortal(this.props.children, this.container);
    }

    static instancesNumber = 0;
}

export default Portal;
