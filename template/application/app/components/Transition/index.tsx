/*
 * @description
 * 提供简单的动画组件。默认提供了Fade、Zoom、Flow、Flip、Collapse等动画效果。
 * 基于react-transition-group实现，通过in属性控制组件显隐。
 *
 * @prop in: boolean 表示组件展示/隐藏
 * @prop timeout: number 动画持续时间
 * @prop direction: 'v' | 'h' 该属性紧紧Collapse可用，表示折叠的方向，v纵向，h横向
 *
 * 更多属性配置可以查看 http://reactcommunity.org/react-transition-group/transition
 *
 * <Fade in={true} timeout={400}>
 *      <div>
 *          该节点从DOM中移除/添加时将会伴随着渐隐渐显动画
 *      </div>
 * </Fade>
 *
 * 你还可以利用 withTransition 高阶组件，快速创建自定义动画组件，其基于CSSTransition组件，需要额外的css编写动画样式。
 */
import React from 'react';
import withTransition, { TransitionProps } from './withTransition';
import './transition.scss';

export { withTransition };

export const Fade: React.ComponentClass<TransitionProps> = withTransition({
    classNames: 'transition-fade',
    timeout: 600
});

export const Zoom: React.ComponentClass<TransitionProps> = withTransition({
    classNames: 'transition-zoom',
    timeout: 600
});

export const Flow: React.ComponentClass<TransitionProps> = withTransition({
    classNames: 'transition-flow',
    timeout: 600
});

export const Flip: React.ComponentClass<TransitionProps> = withTransition({
    classNames: 'transition-flip',
    timeout: 600
});

export { default as Collapse } from './Collspse';
