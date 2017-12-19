import React, { Component } from 'react';
import img from 'static/images/cat.jpg';

class ImgDemo extends Component {
    render() {
        return <img src={img} width="200" alt="" />;
    }
}

export default ImgDemo;
