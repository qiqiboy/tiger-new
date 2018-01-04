import React from 'react';
import modal from '../modal';
import DialogContainer from './container';

const btnConfig = {
    ok: {
        text: '确定',
        className: 'btn-primary',
        click: function() {
            this.close();
        }
    },
    cancel: {
        text: '取消',
        className: 'btn-default',
        click: function() {
            this.dismiss();
        }
    }
};

const Dialog = (content, config = {}) => {
    let btns = config.btns || ['ok'];
    let propsConfig = {
        content: content || '这是一条信息',
        title: config.title,
        btns: btns.map(btn => btnConfig[btn] || btn)
    };

    return modal.open({
        size: 'dialog',
        windowClass: config.windowClass,
        windowTopClass: config.windowTopClass,
        backdrop: config.backdrop || 'static',
        animation: config.animation || 'slide',
        component: modalProps => <DialogContainer {...propsConfig} {...modalProps} />
    }).result;
};

export const alert = (Dialog.alert = (content, settings = {}) => Dialog(content, { btns: ['ok'], ...settings }));
export const confirm = (Dialog.confirm = (content, settings = {}) =>
    Dialog(content, { btns: ['ok', 'cancel'], ...settings }));

export default Dialog;
