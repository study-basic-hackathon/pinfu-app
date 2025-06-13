import { defineAuth } from "@aws-amplify/backend";
// import { postConfirmationFunction } from "../functions/postConfirmation/resource";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    "custom:nickname": {
      dataType: "String",
      mutable: true,
    },
  },
  // triggers: {
  //   postConfirmation: postConfirmationFunction,
  // },
});
