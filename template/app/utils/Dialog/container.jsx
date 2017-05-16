import React, { isValidElement } from 'react';
import './style.scss';

const noop = function() {}; //new Function

const DialogContainer = ({ title, content: Content, close, btns, dismiss }) => {
    const buttons = btns.map(({ text = '', className = '', click = noop }, index) => {
        return <button key={index} className={`btn ${className}`} onClick={click.bind({close, dismiss})}>{text}</button>
    });
    const body = typeof Content === 'object' || typeof Content === 'function' ?
        <div className="modal-body">
            {isValidElement(Content) ? Content : <Content />}
        </div> :
        <div className="modal-body" dangerouslySetInnerHTML={{__html:Content}}></div>;

    return (
        <div className="modal-dialog-root modal-default">
            {title && <div className="modal-heading">{title}</div>}
            {body}
            <div className="modal-footer">
                {buttons}
            </div>
        </div>
    )
}

export default DialogContainer;
