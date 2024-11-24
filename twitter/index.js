// test-verify-list.js
require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

const twitterClientUser = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET_KEY,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const v1Client = twitterClientUser.v1;

async function verifyList(listId) {
  try {
    console.log(`Verifying list ID: ${listId}`);
    const list = await v1Client.get('lists/show', { list_id: listId });
    console.log(`List Name: ${list.name}`);
    console.log(`List Description: ${list.description}`);
    console.log(`List Mode: ${list.mode}`); // 'public' or 'private'
  } catch (error) {
    console.error('Error verifying list:', {
      message: error.message,
      statusCode: error.statusCode,
      errors: error.errors,
      headers: error.headers,
    });
  }
}

const knownListId = '1735710680425304256'; // Replace with your list ID

verifyList(knownListId);
