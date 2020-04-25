import React from 'react';
import { Helmet } from 'react-helmet';

interface TitleProps {
    title: string;
}

const SITE_TITLE = 'React App';

const Title: React.FC<TitleProps> = ({ title }) => (
    <Helmet>
        <title>
            {title} - {SITE_TITLE}
        </title>
    </Helmet>
);

export default Title;
