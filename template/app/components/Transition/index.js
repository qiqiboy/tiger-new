import { withTransition } from 'react-awesome-snippets';
import './transition.scss';

export const Fade = withTransition({
    classNames: 'transition-fade',
    timeout: 600
});
export const Zoom = withTransition({
    classNames: 'transition-zoom',
    timeout: 600
});
export const Flow = withTransition({
    classNames: 'transition-flow',
    timeout: 600
});
