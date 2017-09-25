import React, {isValidElement} from 'react';
import {render as reactRender, unmountComponentAtNode} from 'react-dom';
import ModalContainer from './container';
import makeAnimation from './makeAnimation';

import './style.scss';

const arrayFrom = Array.from || (collection => [].slice.call(collection));

const createElementFromString = string => {
    let container = document.createElement('div');
    let elements;

    container.innerHTML = string;

    elements = arrayFrom(container.children);

    elements.forEach(element => document.body.appendChild(element));

    container = null;

    return elements;
}

const defaultSettings = {
    windowClass: null,
    windowTopClass: null,
    component: null,
    size: 'lg', //lg md sm dialog,
    backdrop: true,
    animation: false,
    animationDuration: 500
}

let zIndex = 1340;

let modalInstances = [];

export const open = (settings = {}) => {
    settings = {...defaultSettings, ...settings};
    zIndex++;

    let elements = createElementFromString((settings.backdrop ? `<div class="modal-backdrop" style="z-index:${zIndex};"></div>` : '') +
                                             `<div style="z-index:${zIndex};" class="modal${settings.windowTopClass ? ' ' + settings.windowTopClass : ''}"></div>`);
    let modalElement = elements[elements.length - 1];
    let animationElements = [];

    if(elements.length > 1) {
        animationElements.push(elements[0]);
    }

    let bodyStyle = document.body.style;
    let original_overflow = bodyStyle.overflow;

    let withResolve, withReject, instance, destroying;

    //销毁组件
    const destroy = () => {
        if(destroying) {
            return;
        }

        destroying = true;

        //绑定离开时动画
        makeAnimation(animationElements, 'leave', settings.animation, settings.animationDuration)
            .then(() => {
                unmountComponentAtNode(modalElement);

                elements.forEach(element => document.body.removeChild(element));

                bodyStyle.overflow = original_overflow;

                let i = 0,
                    len = modalInstances.length;
                for (; i < len; i++) {
                    if (modalInstances[i] === instance) {
                        modalInstances.splice(i, 1);
                        break;
                    }
                }

                modalElement = elements = instance = null;
            });
    }

    const close = data => {
        withResolve(data);
        destroy();
    }
    const dismiss = err => {
        withReject(err);
        destroy();
    }

    bodyStyle.overflow = 'hidden';

    function render(component, onComplete) {
        if(destroying) {
            return;
        }

        if (!isValidElement(settings.component)) {
            unmountComponentAtNode(modalElement);
        }

        if(component){
            settings.component = component;
        }

        return reactRender(<ModalContainer
                    modalElements={elements}
                    {...settings}
                    close={close}
                    dismiss={dismiss} />, modalElement, onComplete);
    }

    instance = {
        close, dismiss, render,
        result: new Promise((resolve, reject) => {
            withResolve = resolve;
            withReject = reject;
        })
    }

    modalInstances.push(instance);

    render(null, () => {
        animationElements.push(modalElement.children[0]);
        //绑定进入时动画
        makeAnimation(animationElements, 'enter', settings.animation, settings.animationDuration);
    });

    return instance;
}

export const closeAll = () => modalInstances.forEach(instance => instance.dismiss());

export const count = () => modalInstances.length;

export default {open, count, closeAll};
