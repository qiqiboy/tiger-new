import { ClickAwayListener, Grow, MenuListProps, Paper, Popper, PopperProps } from '@mui/material';
import { cloneElement, forwardRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';

export type Trigger = 'click' | 'hover';

export interface PopoverHandler {
    setVisible(visible: boolean): void;
}

export interface PopoverProps extends Omit<PopperProps, 'open' | 'content'> {
    content: ReactElement<MenuListProps>;
    children: ReactElement;
    trigger?: Trigger[];
    onClick?: React.MouseEventHandler;
    $ref?: React.RefObject<PopoverHandler>;
    open?: boolean;
}

type BindEventType = 'onMouseEnter' | 'onMouseLeave' | 'onClick';

/*
 * 下拉菜单，同antd中的Popover，基于MUI中的Popper实现
 *
 * 注意，与MUI中的Popover不同，并不会禁用scroll和backdrop，这个更符合大多数场景
 *
 * <Popover content="some content here">
 *        <Button>Get It</Button>
 *    </Popover>
 */
export const Popover = forwardRef<any, PopoverProps>(
    ({ trigger = ['hover'], content, children, onClick, $ref, open, ...props }, ref) => {
        const [visible, setVisible] = useState(false);
        const anchorRef = useRef<{
            node: HTMLElement | null;
        }>({
            node: null
        });

        const handlers: Partial<Record<BindEventType, React.EventHandler<any>>> = {};
        const paperHandlers: Partial<Record<BindEventType, React.EventHandler<any>>> = {};

        trigger.forEach(type => {
            if (type === 'hover') {
                Object.assign(handlers, {
                    onMouseEnter: ev => {
                        anchorRef.current!.node = ev.currentTarget as HTMLElement;

                        setVisible(true);
                    },
                    onMouseLeave: () => setVisible(false)
                });

                Object.assign(paperHandlers, {
                    onMouseEnter: () => {
                        setVisible(true);
                    },

                    onMouseLeave: () => {
                        setVisible(false);
                    }
                });
            }

            if (type === 'click') {
                handlers.onClick = ev => {
                    anchorRef.current!.node = ev.currentTarget as HTMLElement;
                    setVisible(!visible);
                };
            }
        });

        useImperativeHandle($ref, () => ({
            setVisible
        }));

        return (
            <>
                {cloneElement(children, handlers)}
                <Popper
                    {...props}
                    ref={ref}
                    anchorEl={anchorRef.current.node}
                    open={typeof open === 'undefined' ? visible : open}
                    transition>
                    {({ TransitionProps }) => (
                        <Grow {...TransitionProps}>
                            <Paper {...paperHandlers} onClick={onClick}>
                                <ClickAwayListener onClickAway={() => setVisible(false)}>{content}</ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </>
        );
    }
);
