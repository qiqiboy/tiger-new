import React, { Component } from 'react';
import { ButtonToolbar } from 'react-bootstrap';
import moment from 'moment';
import { withForm, $Formutil, FormGroup } from 'react-bootstrap-formutil';
import MessageBox from 'components/MessageBox';
import ErrorBox from 'components/ErrorBox';
import Loading from 'components/Loading';
import Button from 'components/Button';
import Modal from 'components/Modal';
import Dialog from 'components/Dialog';
import Toast from 'components/Toast';
import Switch from 'components/Switch';
import FAQ from 'components/FAQ';
import DatePicker from 'components/DatePicker';

import './style.scss';

interface IProps {
    $formutil: $Formutil<any>;
}

// @ts-ignore
class ComDemo extends Component<IProps> {
    handleClick = () => Toast.show('重新请求!');
    render() {
        return (
            <div className="demo app-main">
                <h3>Switch</h3>
                <FormGroup name="switch-primary" $defaultValue="a">
                    <Switch checked="a" unchecked="b" />
                </FormGroup>
                <FormGroup name="switch-danger" $defaultValue="a">
                    <Switch type="danger" checked="a" unchecked="b">
                        Danger
                    </Switch>
                </FormGroup>
                <FormGroup name="switch-success" $defaultValue="a">
                    <Switch type="success" checked="a" unchecked="b">
                        Success
                    </Switch>
                </FormGroup>
                <FormGroup name="switch-info" $defaultValue="b">
                    <Switch type="info" checked="a" unchecked="b" disabled>
                        Info
                    </Switch>
                </FormGroup>
                <FormGroup name="switch-warning" $defaultValue="a">
                    <Switch type="warning" checked="a" unchecked="b" disabled>
                        Warning
                    </Switch>
                </FormGroup>

                <h3>forms</h3>
                <FormGroup
                    name="datepicker"
                    label="出生日期"
                    required
                    $parser={value => value.format('YYYY-MM-DD')}
                    $formatter={value => (value ? moment(value) : null)}>
                    <DatePicker
                        initialDate={moment().subtract(30, 'year')}
                        maxDate={moment().subtract(18, 'year')}
                        minDate={moment().subtract(65, 'year')}
                    />
                </FormGroup>

                <h3>
                    FAQ{' '}
                    <FAQ>
                        <h5>老虎小知识</h5>
                        这里显示一个问号图标，点击后出现浮窗详细内容解释。
                        这里显示一个问号图标，点击后出现浮窗详细内容解释。
                        这里显示一个问号图标，点击后出现浮窗详细内容解释。
                        这里显示一个问号图标，点击后出现浮窗详细内容解释。
                        这里显示一个问号图标，点击后出现浮窗详细内容解释。
                    </FAQ>
                </h3>

                <h3>MessageBox</h3>
                <MessageBox
                    type="warning"
                    message="需要在最后一步上传包含您填写的地址【房产证】的文件，无法提供将会影响后续的开户进展和交易功能。"
                />
                <MessageBox message="danger" type="danger" />
                <MessageBox message="info" type="info" />
                <MessageBox message="success" type="success" />
                <MessageBox message="default: 可以通过 icon 自定义图标" type="default" icon="thumbs-up" />
                <MessageBox message="default: icon=null 不显示图标" type="default" icon={null} />

                <h3>ErrorBox</h3>
                <ErrorBox
                    error={new Error('这里显示错误信息，并且可以通过 onClick 传递重试按钮回调')}
                    onClick={this.handleClick}
                />

                <h3>Loading</h3>
                <Loading />
                <Loading label="加载中..." />

                <h3>Button</h3>
                <ButtonToolbar>
                    <Button>Default</Button>
                    <Button bsStyle="primary">Primary</Button>
                    <Button bsStyle="success">Success</Button>
                    <Button bsStyle="info">Info</Button>
                    <Button bsStyle="warning">Warning</Button>
                    <Button bsStyle="danger">Danger</Button>
                    <Button bsStyle="link">Link</Button>
                </ButtonToolbar>
                <br />
                <ButtonToolbar>
                    <Button loading={true}>Default Loading</Button>
                    <Button loading={true} bsStyle="primary">
                        Primary Loading
                    </Button>
                    <Button loading={true} bsStyle="success">
                        Success Loading
                    </Button>
                    <Button loading={true} bsStyle="info">
                        Info Loading
                    </Button>
                    <Button loading={true} bsStyle="warning">
                        Warning Loading
                    </Button>
                    <Button loading={true} bsStyle="danger">
                        Danger Loading
                    </Button>
                </ButtonToolbar>

                <h3>Modal & Dialog</h3>
                <ButtonToolbar>
                    <Button
                        onClick={() =>
                            Modal.open({
                                component: props => (
                                    <div style={{ padding: '30px' }}>
                                        文案文案文案文案文案文案
                                        <a onClick={props.close} href="javascript:;">
                                            close
                                        </a>
                                    </div>
                                )
                            })
                        }>
                        Modal
                    </Button>
                    <Button
                        onClick={() =>
                            Dialog.alert({ title: '标题', content: '确认对话框' }).then(() => console.log('close'))
                        }>
                        Dialog.alert
                    </Button>
                    <Button onClick={() => Dialog.confirm({ content: '选择对话框' })}>Dialog.confirm</Button>
                </ButtonToolbar>

                <h3>Toast</h3>
                <ButtonToolbar>
                    <Button onClick={() => Toast.show('toast消息框')}>Toast.show</Button>
                    <Button
                        onClick={() => {
                            Toast.loading(true);

                            setTimeout(() => Toast.loading(false), 3000);
                        }}>
                        Toast.loading
                    </Button>
                </ButtonToolbar>
            </div>
        );
    }
}

export default withForm(ComDemo);
