/*
 * @description
 * 提供简单的动画组件。默认提供了Fade、Zoom、Flow、Collspse四种动画效果。
 * 由于动画主要基于css3动画，为了方便控制动画时间，默认提供了从100ms到3000ms区间（每100ms间隔）的动画时间设定。
 * 在这之间的动画时间无需额外设置css:
 *
 * <Fade in={true} timeout={400}>
 *      <div>
 *          该节点从DOM中移除/添加时将会伴随着渐隐渐显动画
 *      </div>
 * </Fade>
 *
 * 你还可以利用 withTransition 高阶组件，快速创建自定义动画组件，其基于CSSTransition组件，需要额外的css编写动画样式。
 */
import withTransition from './withTransition';
import './transition.scss';

export { withTransition };

export const Fade = withTransition(
    {
        classNames: 'transition-fade',
        timeout: 600
    },
    true
);

export const Zoom = withTransition(
    {
        classNames: 'transition-zoom',
        timeout: 600
    },
    true
);

export const Flow = withTransition(
    {
        classNames: 'transition-flow',
        timeout: 600
    },
    true
);

export { default as Collapse } from './Collspse';
