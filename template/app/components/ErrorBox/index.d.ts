import React from 'react';

interface Error {
    message: string;
    [name?: string]: any;
}

interface ErrorBoxProps {
    error: React.ReactNode | Error;
    onClick?: (ev?: React.SyntheticEvent) => void;
}

export default class ErrorBox extends React.Component<ErrorBoxProps> {}
