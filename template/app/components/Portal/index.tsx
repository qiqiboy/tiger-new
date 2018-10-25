import { Component } from 'react';
import { createPortal } from 'react-dom';
import './style.scss';

interface IPortalProps {
    className?: string;
}

class Portal extends Component<IPortalProps> {
    container: Element;

    componentWillUnmount() {
        if (this.container) {
            document.body.removeChild(this.container);
            document.body.classList.remove('portal-opened');
        }
    }

    render() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = this.props.className || '';
            document.body.appendChild(this.container);
            document.body.classList.add('portal-opened');
        }

        return createPortal(this.props.children, this.container);
    }
}

export default Portal;
