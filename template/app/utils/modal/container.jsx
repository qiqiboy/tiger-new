/*eslint no-invalid-this: 0 */
import React, { isValidElement, Component, PropTypes } from 'react';

class ModalContainer extends Component {
    render() {
        const { size, component: MyComponent, windowClass } = this.props;
        //const MyComponent = component;
        let classes = ['modal-container', `modal-${size}`];

        if (windowClass) {
            classes.push(windowClass);
        }

        return (
            <div className={classes.join(' ')} ref="container">
                {(!MyComponent || isValidElement(MyComponent)) ? MyComponent : <MyComponent {...this.props} />}
            </div>
        );
    }

    eventHandler = ev => {
        const { container } = this.refs;

        if (container != ev.target && !container.contains(ev.target)) {
            if (ev.type == 'click') {
                this.props.dismiss();
            } else {
                ev.preventDefault();
            }
        }
    }

    getEvents() {
        let events = ['touchmove', 'mousewheel', 'DOMMouseScroll'];
        if (this.props.backdrop != 'static') {
            events.push('click');
        }

        return events;
    }

    componentDidMount() {
        const element = this.refs.container.parentNode;

        this.getEvents().forEach(event =>
            element.addEventListener(event, this.eventHandler, false));
    }

    componentWillUnmount() {
        const element = this.refs.container.parentNode;

        this.getEvents().forEach(event =>
            element.removeEventListener(event, this.eventHandler, false));
    }

    static propTypes = {
        component: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),
        windowClass: PropTypes.string,
        windowTopClass: PropTypes.string,
        size: PropTypes.string.isRequired,
        backdrop: PropTypes.oneOf([true, false, 'static']),
        animation: PropTypes.oneOf(['fade', 'slide', 'zoom', false, true])
    }
}

export default ModalContainer;
