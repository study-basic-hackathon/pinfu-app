import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
// import { postConfirmationFunction } from './functions/postConfirmation/resource';

export const backend = defineBackend({
  auth,
  data,
  // postConfirmationFunction,
});
