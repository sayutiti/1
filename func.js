'use strict'

const Client = require('instagram-private-api').V1;
const delay = require('delay');
const _ = require('lodash');
const Spinner = require('cli-spinner').Spinner;

const insta = async (username,password) => {
  const Device = new Client.Device(username);
  const Storage = new Client.CookieMemoryStorage();
  const session = new Client.Session(Device, Storage);
  try {
    await Client.Session.create(Device, Storage, username, password)
    var account = await session.getAccount();
    account = account.params;
    this.session = session;
    this.account = account;
    this.myId = account.id;
    return Promise.resolve({session,account});
  } catch (err) {
    return Promise.reject(err);
  }
}

insta.setTargetId = (id) => {
  this.tagetId = id || this.myId;
}

insta.getFollowers = async () => {
  const feed = new Client.Feed.AccountFollowers(this.session, this.tagetId);
  try{
    feed.map = item => item.params;
    return Promise.resolve(feed.all());
  }catch (e){
    return Promise.reject(err);
  }
}

insta.getFollowing = async () => {
  const feed = new Client.Feed.AccountFollowing(this.session, this.tagetId);
  try{
    feed.map = item => item.params;
    return Promise.resolve(feed.all());
  }catch (e){
    return Promise.reject(err);
  }
}

insta.doFollow = async () => {
  try {
    await Client.Relationship.create(this.session, this.tagetId);
    return true;
  } catch (e) {
    return false;
  }
}

insta.doUnfollow = async () => {
  try {
    await Client.Relationship.destroy(this.session, this.tagetId);
    return true;
  } catch (e){
    return e;
  }
}

insta.doComment = async (mediaId, text) => {
  try {
    await Client.Comment.create(this.session, mediaId, text);
    return true;
  } catch(e){
    return false;
  }
}

insta.doLike = async (mediaId) => {
  try{
    await Client.Like.create(this.session, mediaId);
    return true;
  } catch(e) {
    return false;
  }
}

insta.getMedia = async () => {
  const feeds = new Client.Feed.UserMedia(this.session, this.tagetId);
  try {
    feeds.map = item => item.params;
    return Promise.resolve(feeds.all());
  } catch (err) {
    return Promise.reject(err);
  }
}

insta.deleteMedia = async (mediaId) => {
  try {
    await Client.Media.delete(this.session, mediaId);
    return true;
  } catch(err) {
    return false;
  }
}

insta.doSleep = async (sleep, message) => {
  const spinner = new Spinner(message);
  spinner.setSpinnerString(4);
  spinner.start();
  await delay(sleep);
  spinner.stop(false);
  process.stdout.write('\n');
}

module.exports = insta;
