import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // 麻雀プレイヤーのモデル
  Player: a
    .model({
      name: a.string().required(),
      userId: a.string().required(), // Cognito User IDを保存
    })
    .authorization((allow) => [
      allow.publicApiKey(),
      allow.authenticated(), // 認証済みユーザーのみアクセス可能
    ]),

  // 麻雀スコアのモデル
  MahjongScore: a
    .model({
      date: a.datetime().required(),
      playerCount: a.integer().required(),
      gameType: a.string().required(), // 東風 or 半荘
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // スコアとプレイヤーの関連モデル
  MahjongScorePlayer: a
    .model({
      score: a.integer().required(),
      playerId: a.string().required(),
      mahjongScoreId: a.string().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
    
  // チャットメッセージのモデル
  ChatMessage: a
    .model({
      content: a.string().required(),
      playerId: a.string().required(),
      createdAt: a.datetime().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
    
  // リプライメッセージのモデル
  ChatReply: a
    .model({
      content: a.string().required(),
      chatMessageId: a.string().required(), // 返信先のメッセージID
      playerId: a.string().required(),
      createdAt: a.datetime().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
    
  // いいねのモデル
  ChatLike: a
    .model({
      chatMessageId: a.string(), // メッセージIDへのいいね
      chatReplyId: a.string(), // リプライIDへのいいね
      playerId: a.string().required(), // いいねしたプレイヤーID
      createdAt: a.datetime().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
