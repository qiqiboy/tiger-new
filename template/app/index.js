import $ from 'jquery';
import React from 'react';
import {render} from 'react-dom';

import 'static/css/index.scss';

import ImgDemo from 'components/ImgDemo';

render(<ImgDemo />, $('#img-demo')[0]);
