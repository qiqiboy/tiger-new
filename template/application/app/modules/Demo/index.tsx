import React, { Component } from 'react';
import { ButtonToolbar, Card, Form, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { $Formutil, CheckboxGroup, FormGroup, RadioGroup, SwitchGroup, withForm } from 'react-bootstrap-formutil';
import Button from 'components/Button';
import Debug from 'components/Debug';
import Dialog from 'components/Dialog';
import ErrorBox from 'components/ErrorBox';
import Loading from 'components/Loading';
import Modal from 'components/Modal';
import Toast from 'components/Toast';
import { Collapse, Fade, Flip, Flow, Zoom } from 'components/Transition';
import './style.scss';

interface DemoProps {
    $formutil: $Formutil<any>;
}

// @ts-ignore
class ComDemo extends Component<DemoProps> {
    readonly state = {
        visible: false,
        iframe: false
    };

    handleClick = () => Toast.show('重新请求!');
    handleSubmit = ev => {
        ev.preventDefault();

        const { $invalid, $getFirstError } = this.props.$formutil;

        if ($invalid) {
            Dialog.alert($getFirstError());

            this.props.$formutil.$batchDirty(true);
        } else {
            Dialog.alert('Submitted!');
        }
    };

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
            <Form className="app-demo app-main" onSubmit={this.handleSubmit} noValidate>
                <Card className="mb-3">
                    <Card.Body>
                        <Card.Title>登录表单 - 纵向 - demo1</Card.Title>
                        <FormGroup
                            className="mb-2"
                            label="Email address"
                            name="demo1.email"
                            helper="We'll never share your email with anyone else."
                            required
                            controlId="demo1.formBasicEmail">
                            <Form.Control type="email" placeholder="Enter email" />
                        </FormGroup>

                        <FormGroup
                            className="mb-2"
                            label="Password"
                            name="demo1.password"
                            required
                            controlId="demo1.formBasicPassword">
                            <Form.Control type="password" placeholder="Password" />
                        </FormGroup>

                        <FormGroup className="mb-2" name="demo1.checkme" controlId="demo1.formBasicCheckbox">
                            <Form.Check type="checkbox" label="Check me out" />
                        </FormGroup>

                        <Button className="w-100" htmlType="submit">
                            Submit
                        </Button>
                    </Card.Body>
                </Card>
                <Card className="mb-3">
                    <Card.Body>
                        <Card.Title>单选组和多选组 - demo2</Card.Title>
                        <FormGroup name="demo2.checkbox" required className="mb-2">
                            <CheckboxGroup>
                                <Form.Check
                                    checked
                                    value="1"
                                    type="checkbox"
                                    id="demo2.checkbox.1"
                                    label={`Check this custom checkbox`}
                                />

                                <Form.Check
                                    disabled
                                    value="2"
                                    type="checkbox"
                                    label="disabled checkbox"
                                    id="demo2.checkbox.2"
                                />
                            </CheckboxGroup>
                        </FormGroup>
                        <FormGroup name="demo2.radio" required className="mb-2">
                            <RadioGroup>
                                <Form.Check
                                    checked
                                    value="1"
                                    type="radio"
                                    id="demo2.radio.1"
                                    label={`Check this custom radio`}
                                />

                                <Form.Check disabled value="2" type="radio" label="disabled radio" id="demo2.radio.2" />
                            </RadioGroup>
                        </FormGroup>
                        <FormGroup name="demo2.switch" required className="mb-2">
                            <SwitchGroup>
                                <Form.Check
                                    value="1"
                                    checked
                                    type="switch"
                                    id="demo2.switch.1"
                                    label={`Check this custom switch`}
                                />

                                <Form.Check
                                    disabled
                                    value="2"
                                    type="switch"
                                    label="disabled switch"
                                    id="demo2.switch.2"
                                />
                            </SwitchGroup>
                        </FormGroup>

                        <FormGroup name="demo2.inlineSwitch" required feedback className="mb-2">
                            <CheckboxGroup>
                                <Form.Check
                                    inline
                                    value="1"
                                    checked
                                    type="switch"
                                    id="demo2.inlineSwitch.1"
                                    label="inline 1"
                                />

                                <Form.Check
                                    inline
                                    disabled
                                    value="2"
                                    type="switch"
                                    label="inline 2"
                                    id="demo2.inlineSwitch.2"
                                />
                            </CheckboxGroup>
                        </FormGroup>
                    </Card.Body>
                </Card>
                <Card className="mb-3">
                    <Card.Body>
                        <Card.Title>其他组件 - demo3</Card.Title>
                        <FormGroup label="input" name="demo3.input" required controlId="demo3.input" className="mb-2">
                            <Form.Control type="email" placeholder="Enter email" />
                        </FormGroup>

                        <FormGroup
                            label="textarea"
                            name="demo3.textarea"
                            required
                            controlId="demo3.textarea"
                            className="mb-2">
                            <Form.Control as="textarea" />
                        </FormGroup>

                        <FormGroup
                            label="select"
                            name="demo3.select"
                            className="mb-2"
                            helper="We'll never share your email with anyone else."
                            required
                            controlId="demo3.select">
                            <Form.Control as="select">
                                <option disabled value="">
                                    请选择
                                </option>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                            </Form.Control>
                        </FormGroup>

                        <FormGroup
                            label="select"
                            className="mb-2"
                            name="demo3.multipleSelect"
                            helper="We'll never share your email with anyone else."
                            required
                            controlId="demo3.multipleSelect">
                            <Form.Control as="select" multiple>
                                <option disabled value="">
                                    请选择
                                </option>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                            </Form.Control>
                        </FormGroup>

                        <FormGroup
                            name="demo3.toggleButtonCheckbox"
                            className="mb-2"
                            required
                            controlId="demo3.toggleButtonCheckbox"
                            $defaultValue={[2]}>
                            <ToggleButtonGroup type="checkbox">
                                <ToggleButton value={1} id="t1">
                                    Option 1
                                </ToggleButton>
                                <ToggleButton value={2} id="t2">
                                    Option 2
                                </ToggleButton>
                                <ToggleButton value={3} id="t3">
                                    Option 3
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </FormGroup>

                        <FormGroup
                            name="demo3.toggleButtonRadio"
                            className="mb-2"
                            required
                            controlId="demo3.toggleButtonRadio"
                            $defaultValue={2}>
                            <ToggleButtonGroup type="radio" name="demo3.toggleButtonRadio">
                                <ToggleButton value={1} id="t4">
                                    Option 1
                                </ToggleButton>
                                <ToggleButton value={2} id="t5">
                                    Option 2
                                </ToggleButton>
                                <ToggleButton value={3} id="t6">
                                    Option 3
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </FormGroup>

                        <FormGroup name="demo3.checkbox" required controlId="demo3.checkbox" className="mb-2">
                            <Form.Check type="checkbox" label="checkbox" />
                        </FormGroup>

                        <FormGroup name="demo3.radio" required controlId="demo3.radio" className="mb-2">
                            <Form.Check type="radio" label="radio" />
                        </FormGroup>

                        <FormGroup name="demo3.switch" required controlId="demo3.switch" className="mb-2">
                            <Form.Check type="switch" label="switch" />
                        </FormGroup>
                    </Card.Body>
                </Card>
                <h3>ErrorBox</h3>
                <ErrorBox
                    error={new Error('这里显示错误信息，并且可以通过 onClick 传递重试按钮回调')}
                    onClick={this.handleClick}
                />

                <h3>Loading</h3>
                <Loading inline size="sm" />
                <Loading inline />
                <Loading inline tip="加载中..." />
                <Loading inline size="sm" color="success" />
                <Loading inline color="success" />
                <Loading inline tip="加载中..." color="success" />
                <Loading inline size="sm" color="danger" />
                <Loading inline color="danger" />
                <Loading inline tip="加载中..." color="danger" />
                <Loading inline size="sm" color="dark" type="grow" />
                <Loading inline color="dark" type="grow" />
                <Loading inline tip="加载中..." color="dark" type="grow" />

                <h3>Button</h3>
                <ButtonToolbar className="align-items-center">
                    <Button type="primary" size="xs">
                        Extra Small
                    </Button>
                    <Button type="primary" size="sm">
                        Small
                    </Button>
                    <Button type="primary">Normal</Button>
                    <Button type="primary" size="lg">
                        Large
                    </Button>
                </ButtonToolbar>
                <p />
                <ButtonToolbar>
                    <Button type="primary">Primary</Button>
                    <Button type="secondary">Secondary</Button>
                    <Button type="success">Success</Button>
                    <Button type="info">Info</Button>
                    <Button type="warning">Warning</Button>
                    <Button type="danger">Danger</Button>
                    <Button type="light">Light</Button>
                    <Button type="dark">Dark</Button>
                    <Button type="blue">Blue</Button>
                    <Button type="link">Link</Button>
                </ButtonToolbar>
                <p />
                <ButtonToolbar>
                    <Button round type="primary">
                        Primary
                    </Button>
                    <Button round type="secondary">
                        Secondary
                    </Button>
                    <Button round type="success">
                        Success
                    </Button>
                    <Button round type="info">
                        Info
                    </Button>
                    <Button round type="warning">
                        Warning
                    </Button>
                    <Button round type="danger">
                        Danger
                    </Button>
                    <Button round type="light">
                        Light
                    </Button>
                    <Button round type="dark">
                        Dark
                    </Button>
                    <Button round type="blue">
                        Blue
                    </Button>
                    <Button round type="link">
                        Link
                    </Button>
                </ButtonToolbar>
                <p />
                <ButtonToolbar>
                    <Button ghost type="primary">
                        Primary
                    </Button>
                    <Button ghost type="secondary">
                        Secondary
                    </Button>
                    <Button ghost type="success">
                        Success
                    </Button>
                    <Button ghost type="info">
                        Info
                    </Button>
                    <Button ghost type="warning">
                        Warning
                    </Button>
                    <Button ghost type="danger">
                        Danger
                    </Button>
                    <Button ghost type="light">
                        Light
                    </Button>
                    <Button ghost type="dark">
                        Dark
                    </Button>
                    <Button ghost type="blue">
                        Blue
                    </Button>
                    <Button ghost type="link">
                        Link
                    </Button>
                </ButtonToolbar>
                <p />
                <ButtonToolbar>
                    <Button ghost round type="primary">
                        Primary
                    </Button>
                    <Button ghost round type="secondary">
                        Secondary
                    </Button>
                    <Button ghost round type="success">
                        Success
                    </Button>
                    <Button ghost round type="info">
                        Info
                    </Button>
                    <Button ghost round type="warning">
                        Warning
                    </Button>
                    <Button ghost round type="danger">
                        Danger
                    </Button>
                    <Button ghost round type="light">
                        Light
                    </Button>
                    <Button ghost round type="dark">
                        Dark
                    </Button>
                    <Button ghost round type="blue">
                        Blue
                    </Button>
                    <Button ghost round type="link">
                        Link
                    </Button>
                </ButtonToolbar>
                <br />
                <ButtonToolbar>
                    <Button loading type="primary">
                        Primary
                    </Button>
                    <Button loading type="secondary">
                        Secondary
                    </Button>
                    <Button loading type="success">
                        Success
                    </Button>
                    <Button loading type="info">
                        Info
                    </Button>
                    <Button loading type="warning">
                        Warning
                    </Button>
                    <Button loading type="light">
                        Light
                    </Button>
                    <Button loading type="dark">
                        Dark
                    </Button>
                    <Button loading type="blue">
                        Blue
                    </Button>
                    <Button loading type="danger">
                        Danger
                    </Button>
                </ButtonToolbar>
                <br />
                <ButtonToolbar>
                    <Button ghost round loading type="primary">
                        Primary
                    </Button>
                    <Button ghost round loading type="secondary">
                        Secondary
                    </Button>
                    <Button ghost round loading type="success">
                        Success
                    </Button>
                    <Button ghost round loading type="info">
                        Info
                    </Button>
                    <Button ghost round loading type="warning">
                        Warning
                    </Button>
                    <Button ghost round loading type="light">
                        Light
                    </Button>
                    <Button ghost round loading type="dark">
                        Dark
                    </Button>
                    <Button ghost round loading type="blue">
                        Blue
                    </Button>
                    <Button ghost round loading type="danger">
                        Danger
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
                                        <Button type="link" onClick={props.close}>
                                            close
                                        </Button>
                                    </div>
                                )
                            }).result.then(
                                () => console.log('close'),
                                () => console.log('dismiss')
                            )
                        }>
                        Modal
                    </Button>
                    <Button
                        onClick={() =>
                            Dialog.alert({ title: '标题', content: '确认对话框' }).then(() => console.log('close'))
                        }>
                        Dialog.alert
                    </Button>
                    <Button onClick={() => Dialog.confirm({ content: '选择对话框' })}>Dialog.confirm</Button>{' '}
                    <Button
                        onClick={() =>
                            Dialog.confirm({
                                content: '选择对话框',
                                onOk() {
                                    return new Promise(resolve => setTimeout(resolve, 3000));
                                }
                            })
                        }>
                        Dialog Promise
                    </Button>
                </ButtonToolbar>

                <h3>Toast</h3>
                <ButtonToolbar>
                    <Button onClick={() => Toast.show('toast消息框')}>Toast.show</Button>
                    <Button
                        onClick={() => {
                            Toast.loading(true, 'loading...');

                            setTimeout(() => Toast.loading(false), 3000);
                        }}>
                        Toast.loading
                    </Button>
                </ButtonToolbar>

                <h3>Transition</h3>
                <FormGroup name="transition" $defaultValue="Fade">
                    <ToggleButtonGroup type="radio" name="1">
                        <ToggleButton value="Fade" id="t-fade">
                            Fade
                        </ToggleButton>
                        <ToggleButton value="Zoom" id="t-zoom">
                            Zoom
                        </ToggleButton>
                        <ToggleButton value="Flow" id="t-flow">
                            Flow
                        </ToggleButton>
                        <ToggleButton value="Flip" id="tflip">
                            Flip
                        </ToggleButton>
                        <ToggleButton value="CollapseV" id="t-cv">
                            Collapse Vertical
                        </ToggleButton>
                        <ToggleButton value="CollapseH" id="t-ch">
                            Collapse Horizontal
                        </ToggleButton>
                    </ToggleButtonGroup>
                </FormGroup>
                <p>
                    <Button
                        type="primary"
                        onClick={() =>
                            this.setState({
                                visible: !this.state.visible
                            })
                        }>
                        Toggle
                    </Button>
                </p>
                <Transition in={this.state.visible} direction={direction}>
                    <div>
                        <h1>这里将被动画处理</h1>
                        <p>
                            默认提供了四种动画效果：<code>Fade</code> <code>Zoom</code> <code>Flow</code>{' '}
                            <code>Flip</code> <code>Collapse</code>
                        </p>
                    </div>
                </Transition>

                <h3>Debug</h3>
                <Debug data={this.props.$formutil.$params} />
            </Form>
        );
    }
}

export default withForm(ComDemo);
