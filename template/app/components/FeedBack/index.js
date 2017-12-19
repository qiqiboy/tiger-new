import React, { Component } from 'react';
import EasyForm, { Field } from 'react-easyform';

class FeedBack extends Component {
    submit = e => {
        alert('已提交！');
    };

    render() {
        return (
            <div className="form">
                <Field name="name" placeholder="您的名字" required validMessage={{ required: '请输入姓名' }} />
                <Field
                    name="content"
                    type="textarea"
                    rows="5"
                    placeholder="您的问题"
                    required
                    validMessage={{ required: '请输入内容' }}
                />
                <button onClick={this.submit} disabled={this.props.easyform.$invalid ? true : false}>
                    提交
                </button>
                <pre>{JSON.stringify(this.props.params, '\n', 4)}</pre>
            </div>
        );
    }
}

export default EasyForm(FeedBack, {
    errorLevel: 3
});
