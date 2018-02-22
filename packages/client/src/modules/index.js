import student from './student';
import karma from './karma';
import counter from './counter';
import post from './post';
import upload from './upload';
import user from './user';
import subscription from './subscription';
import pageNotFound from './pageNotFound';
import './favicon';

import Feature from './connector';

export default new Feature(student, karma, counter, post, upload, user, subscription, pageNotFound);
