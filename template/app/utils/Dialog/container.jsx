import React from 'react';
import './style.scss';

const noop = function(){}; //new Function

const DialogContainer = ({title, content, close, btns, dismiss}) => {
    const buttons = btns.map(({text = '', className = '', click = noop}, index) => {
        return <button key={index} className={`btn ${className}`} onClick={click.bind({close, dismiss})}>{text}</button>
    });

    return (
        <div className="modal-dialog-root modal-default">
            {title && <div className="modal-heading">{title}</div>}
            <div className="modal-body" dangerouslySetInnerHTML={{__html:content}}></div>
            <div className="modal-footer">
                {buttons}
            </div>
        </div>
    )
}

export default DialogContainer;
