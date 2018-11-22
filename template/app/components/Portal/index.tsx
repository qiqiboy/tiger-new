import { Component } from 'react';
import { createPortal } from 'react-dom';
import './style.scss';

class Portal extends Component<
    {
        className?: string;
    },
    { loaded: boolean }
> {
    state = { loaded: false };
    container: Element;
    componentDidMount() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = this.props.className || '';
            document.body.appendChild(this.container);
            document.body.classList.add('portal-opened');
        }

        this.setState({
            loaded: true
        });
    }

    componentWillUnmount() {
        if (this.container) {
            document.body.removeChild(this.container);
            document.body.classList.remove('portal-opened');
        }
    }

    render() {
        return this.state.loaded ? createPortal(this.props.children, this.container) : null;
    }
}

export default Portal;
