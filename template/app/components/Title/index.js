import { Component } from 'react';
import PropTypes from 'prop-types';

class Title extends Component {
    componentDidMount() {
        this.preTitle = document.title;

        document.title = this.props.title;
    }

    componentWillUnmount() {
        //document.title = this.preTitle;
    }

    render() {
        return null;
    }

    static propTypes = {
        title: PropTypes.string.isRequired
    };
}

export default Title;
