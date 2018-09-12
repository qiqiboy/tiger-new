import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<any> {
    className?: string;
    disabled?: boolean;
    block?: boolean;
    active?: boolean;
    size?: 'lg' | 'md' | 'sm' | 'xs';
    link?: boolean;
    href?: string;
    type?: 'primary' | 'danger' | 'success' | 'info' | 'default' | 'warning';
    isLoading?: boolean;
    loading?: boolean;
}

export default class Button extends React.Component<ButtonProps> {}
