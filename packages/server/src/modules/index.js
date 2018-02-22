import student from './student';
import karma from './karma';
import counter from './counter';
import post from './post';
import upload from './upload';
import user from './user';
import subscription from './subscription';
import mailer from './mailer';
import graphqlTypes from './graphqlTypes';
import apolloEngine from './apolloEngine';
import './debug';

import Feature from './connector';

export default new Feature(
  student,
  counter,
  karma,
  post,
  upload,
  user,
  subscription,
  mailer,
  graphqlTypes,
  apolloEngine
);
