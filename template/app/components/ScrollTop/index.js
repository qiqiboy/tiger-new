import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';

class ScrollTop extends Component {
    componentDidMount() {
        const { key } = this.props;

        let prevPosition = 0;

        if (key) {
            this.positionKey = 'scroll-to-top-' + key;
            prevPosition = sessionStorage.getItem(this.positionKey) * 1 || 0;
        }

        this.parentNode = this.props.parent ? findDOMNode(this).parentNode : document.body;
        this.parentNode.scrollTop = prevPosition || 0;
    }

    componentWillUnmount() {
        if (this.props.key) {
            sessionStorage.setItem(this.positionKey, this.parentNode.scrollTop);
        }
    }

    render() {
        return <div className="hidden" />;
    }

    static propTypes = {
        parent: PropTypes.bool, //父级节点
        key: PropTypes.string //如果需要存储当前浏览位置，需要传入一个字符串key当作存储的键值
    };
}

export default ScrollTop;
