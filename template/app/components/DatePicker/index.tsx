import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { Glyphicon } from 'react-bootstrap';
import moment from 'moment';
import 'moment/locale/zh-cn';
import MomentLocaleUtils from 'react-day-picker/moment';
import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import { Fade } from 'components/Transition';
import './style.scss';

export interface IDatePickerProps {
    value?: Date | moment.Moment;
    onChange?(value: moment.Moment): void;
    format?: string;
    disabled?: boolean;
    onFocus?(): void;
    onBlur?(): void;
    maxDate?: Date | moment.Moment;
    minDate?: Date | moment.Moment;
    placeholder?: string;
    initialDate?: Date | moment.Moment; // 初始默认显示的时间
}

/**
 * @description
 * 日期选择组件，该组件用于表单，需要配合FormGroup使用。
 * 默认情况下为最近100年范围。可以通过minDate、maxDate来修改可选日期范围
 */
class DatePicker extends Component<IDatePickerProps, { visible: boolean }> {
    static defaultProps = {
        disabled: false,
        value: null,
        format: 'YYYY-MM-DD',
        maxDate: moment().add(50, 'year'),
        minDate: moment().subtract(50, 'year'),
        initialDate: moment(),
        placeholder: '请选择日期'
    };

    readonly state = { visible: false };

    onClick = ev => {
        if (this.props.disabled || (this.dayPickerNode && this.dayPickerNode.contains(ev.target))) {
            //
        } else {
            if (ev.target === this.inputNode) {
                this.setState(preState => ({
                    visible: !preState.visible
                }));
            } else {
                this.setState({
                    visible: false
                });
            }
        }
    };

    public componentDidMount() {
        window.addEventListener('click', this.onClick, false);
    }

    public componentWillUnmount() {
        window.removeEventListener('click', this.onClick, false);
    }

    onDayClick = (date, modifiers) => {
        if (!modifiers.disabled) {
            this.props.onChange!(moment(date));

            this.setState({
                visible: false
            });
        }
    };

    dayPickerNode: any;
    dayPickerObj: any;
    dayPickerRef = jsxNode => {
        if (jsxNode) {
            this.dayPickerObj = jsxNode;
            this.dayPickerNode = findDOMNode(jsxNode);
        } else {
            this.dayPickerObj = null;
            this.dayPickerNode = null;
        }
    };

    inputNode: any;
    inputRef = node => (this.inputNode = node);

    handleYearMonthChange = date => {
        this.dayPickerObj.showMonth(date);
    };

    // 禁止选择超过最大 最小日期范围的时间
    disabledDays = date => {
        const now = moment(date);

        return now.isBefore(this.props.minDate) || now.isAfter(this.props.maxDate);
    };

    public render() {
        const { value, format, disabled, maxDate, minDate, placeholder } = this.props;
        const momentValue = moment(value || this.props.initialDate);

        return (
            <div className={'date-picker-root' + (this.state.visible ? ' date-picker-active' : '')}>
                <Glyphicon glyph="calendar" />
                <input
                    className="form-control"
                    readOnly
                    value={value ? momentValue.format(format) : ''}
                    disabled={disabled}
                    onFocus={this.props.onFocus}
                    onBlur={this.props.onBlur}
                    placeholder={placeholder}
                    ref={this.inputRef}
                />
                <Fade in={this.state.visible}>
                    <DayPicker
                        ref={this.dayPickerRef}
                        localeUtils={MomentLocaleUtils}
                        locale="zh-cn"
                        onDayClick={this.onDayClick}
                        selectedDays={momentValue.toDate()}
                        initialMonth={momentValue.toDate()}
                        showOutsideDays
                        enableOutsideDaysClick
                        disabledDays={this.disabledDays}
                        fromMonth={moment(this.props.minDate).toDate()}
                        toMonth={moment(this.props.maxDate).toDate()}
                        captionElement={({ date, localeUtils }) => (
                            <YearMonth
                                date={date}
                                localeUtils={localeUtils}
                                onChange={this.handleYearMonthChange}
                                maxDate={maxDate as Date}
                                minDate={minDate as Date}
                            />
                        )}
                    />
                </Fade>
            </div>
        );
    }
}

interface IYearMonthProps {
    date: Date;
    localeUtils: any;
    onChange(date: Date): void;
    maxDate: Date;
    minDate: Date;
}
class YearMonth extends Component<IYearMonthProps> {
    onChange = ev => {
        let year = this.props.date.getFullYear();
        let month = this.props.date.getMonth();

        if (ev.target.name === 'year') {
            year = ev.target.value;
        } else {
            month = ev.target.value;
        }

        this.props.onChange(new Date(Number(year), Number(month)));
    };

    getYears = () => {
        const years: number[] = [];

        for (let i = moment(this.props.minDate).year(), j = moment(this.props.maxDate).year(); i <= j; i++) {
            years.push(i);
        }

        return years;
    };

    render() {
        const months = this.props.localeUtils.getMonths('zh-cn');
        const years = this.getYears();

        return (
            <div className="daypicker-year-month">
                <select
                    name="month"
                    className="form-control input-sm"
                    value={this.props.date.getMonth()}
                    onChange={this.onChange}>
                    {months.map((name, index) => (
                        <option key={index} value={index}>
                            {name}
                        </option>
                    ))}
                </select>
                <select
                    name="year"
                    className="form-control input-sm"
                    value={this.props.date.getFullYear()}
                    onChange={this.onChange}>
                    {years.map(name => (
                        <option key={name} value={name}>
                            {name}
                        </option>
                    ))}
                </select>
            </div>
        );
    }
}

export default DatePicker;
