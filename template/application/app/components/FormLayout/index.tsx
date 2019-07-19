import React, { Component, Children } from 'react';
import './style.scss';

export interface IFormLayoutProps {
    layout: string; // layout="1:2"
    className?: string;
}

/**
 * @description
 * 主要用户表单横向多栏弹性布局，可以通过layout属性传递子节点的宽度比列划分
 * 例如：下面的例子即将两个子节点按照1比2的宽度占比进行分配：
 *
 * <FormLayout layout="1:2">
 *  ...
 * </FormLayout>
 */
class FormLayout extends Component<IFormLayoutProps> {
    static defaultProps = {
        layout: ''
    };

    public render() {
        const flexValues = this.props.layout.split(':');
        const noneNullChildren: any[] = [];

        Children.forEach(this.props.children, child => {
            if (child !== null) {
                noneNullChildren.push(child);
            }
        });

        return (
            <div className={'form-layout-root' + (this.props.className ? ' ' + this.props.className : '')}>
                {Children.map(noneNullChildren, (child: any, index) => {
                    return <div className={`form-layout-flex form-layout-flex-${flexValues[index] || 1}`}>{child}</div>;
                })}
            </div>
        );
    }
}

export default FormLayout;
