import {
    TransitionProps,
    EndHandler,
    EnterHandler,
    ExitHandler,
    TransitionActions,
    TransitionChildren
} from 'react-transition-group/Transition';
import CSSTransition from 'react-transition-group/CSSTransition';

// tslint:disable-next-line
export interface TransitionProps extends TransitionActions {
    in?: boolean;
    mountOnEnter?: boolean;
    unmountOnExit?: boolean;
    timeout?: number;
    addEndListener?: EndHandler;
    onEnter?: EnterHandler;
    onEntering?: EnterHandler;
    onEntered?: EnterHandler;
    onExit?: ExitHandler;
    onExiting?: ExitHandler;
    onExited?: ExitHandler;
    children: TransitionChildren;
}

// tslint:disable-next-line
export interface CSSTransitionProps extends TransitionProps {
    classNames: string | CSSTransition.CSSTransitionClassNames;
}
