import React, { Component } from 'react';
import { ButtonToolbar, ToggleButtonGroup, ToggleButton, Jumbotron } from 'react-bootstrap';
import moment from 'moment';
import { withForm, $Formutil, FormGroup } from 'react-bootstrap-formutil';
import Debug from 'components/Debug';
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
import { Fade, Zoom, Flow, Flip, Collapse } from 'components/Transition';

import './style.scss';

interface IProps {
    $formutil: $Formutil<any>;
}

// @ts-ignore
class ComDemo extends Component<IProps> {
    readonly state = {
        visible: false
    };

    handleClick = () => Toast.show('重新请求!');
    render() {
        let Transition;
        let direction;

        switch (this.props.$formutil.$params.transition) {
            case 'Zoom':
                Transition = Zoom;
                break;
            case 'Flow':
                Transition = Flow;
                break;
            case 'Flip':
                Transition = Flip;
                break;
            case 'CollapseV':
                Transition = Collapse;
                direction = 'v';
                break;
            case 'CollapseH':
                Transition = Collapse;
                direction = 'h';
                break;

            default:
                Transition = Fade;
                break;
        }

        return (
            <div className="demo app-main">
                <h3>Switch</h3>
                <FormGroup name="switch-primary" $defaultValue="a" checked="a" unchecked="b">
                    <Switch />
                </FormGroup>
                <FormGroup name="switch-danger" $defaultValue="a" checked="a" unchecked="b">
                    <Switch type="danger">Danger</Switch>
                </FormGroup>
                <FormGroup name="switch-success" $defaultValue="a" checked="a" unchecked="b">
                    <Switch type="success">Success</Switch>
                </FormGroup>
                <FormGroup name="switch-info" $defaultValue="b" checked="a" unchecked="b">
                    <Switch type="info" disabled>
                        Info
                    </Switch>
                </FormGroup>
                <FormGroup name="switch-warning" $defaultValue="a" checked="a" unchecked="b">
                    <Switch type="warning" disabled>
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

                <h3>Transition</h3>
                <FormGroup name="transition" $defaultValue="Fade">
                    <ToggleButtonGroup type="radio" name="1">
                        <ToggleButton value="Fade">Fade</ToggleButton>
                        <ToggleButton value="Zoom">Zoom</ToggleButton>
                        <ToggleButton value="Flow">Flow</ToggleButton>
                        <ToggleButton value="Flip">Flip</ToggleButton>
                        <ToggleButton value="CollapseV">Collapse Vertical</ToggleButton>
                        <ToggleButton value="CollapseH">Collapse Horizontal</ToggleButton>
                    </ToggleButtonGroup>
                </FormGroup>
                <p>
                    <Button
                        bsStyle="primary"
                        onClick={() =>
                            this.setState({
                                visible: !this.state.visible
                            })
                        }>
                        Toggle
                    </Button>
                </p>
                <Transition in={this.state.visible} direction={direction}>
                    <Jumbotron>
                        <h1>这里将被动画处理</h1>
                        <p>
                            默认提供了四种动画效果：<code>Fade</code> <code>Zoom</code> <code>Flow</code>{' '}
                            <code>Flip</code> <code>Collapse</code>
                        </p>
                    </Jumbotron>
                </Transition>

                <h3>Debug</h3>
                <Debug data={this.props.$formutil.$params} />
            </div>
        );
    }
}

export default withForm(ComDemo);
