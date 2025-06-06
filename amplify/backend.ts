import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { postConfirmationFunction } from './function/postConfirmation/resource';

export const backend = defineBackend({
  auth,
  data,
  postConfirmationFunction,
});
