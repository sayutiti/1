const inquirer = require('inquirer');
const rp = require('request-promise');
const insta = require('../func.js');
const Client = require('instagram-private-api').V1;
const _ = require('lodash');
const chalk = require('chalk');

const getLastestMedia = async (session,userId) => {
  const feed = new Client.Feed.UserMedia(session, userId);
  try {
    const result = await feed.get();
    return result;
  } catch (err) {
    return err;
  }
}

const followFollowersTarget = async (session) => {
  const question = [
    {
      type:'input',
      name:'target',
      message:'Insert Username Target (Without @[at])',
      validate: function(value){
        if(!value) return 'Can\'t Empty';
        return true;
      }
    },
    {
      type:'input',
      name:'text',
      message:'Insert Text Comment 1 (Gunakan Pemisah [|] bila lebih dari 1)',
      validate: function(value){
        if(!value) return 'Can\'t Empty';
        return true;
      }
    },
    {
      type:'input',
      name:'sleep',
      message:'Insert Sleep (In MiliSeconds)',
      validate: function(value){
        value = value.match(/[0-9]/);
        if (value) return true;
        return 'Delay is number';
      }
    }
  ]
  try {
    const answers = await inquirer.prompt(question);
    const requestOption = {
      url:'https://www.instagram.com/'+answers.target+'/?__a=1',
      json:true
    }
    var commentArray = answers.text.split('|');
    var cursor;
    var targetId = await rp(requestOption);
    targetId = targetId.user.id;
    const feeds = new Client.Feed.AccountFollowers(session, targetId);
    console.log('')
    do {
      if (cursor) feeds.setCursor(cursor);
      var targetPerson = await feeds.get();
      targetPerson = _.chunk(targetPerson, 5);
      for (targetPerson of targetPerson) {
        await Promise.all(targetPerson.map(async(targetPerson) => {
          var timeNow = new Date();
          timeNow = `${timeNow.getHours()}:${timeNow.getMinutes()}:${timeNow.getSeconds()}`
          var ranComment = _.sample(commentArray);
          const media = await getLastestMedia(session, targetPerson.params.id);
          if (media.length > 0) {
            insta.setTargetId(targetPerson.params.id);
            const task = [
              insta.doFollow() ? chalk`{bold.green SUKSES}` : chalk`{bold.red GAGAL}`,
              insta.doLike(media[0].id) ? chalk`{bold.green SUKSES}` : chalk`{bold.red GAGAL}`,
              insta.doComment(media[0].id, ranComment) ? chalk`{bold.green SUKSES}` : chalk`{bold.red GAGAL}`
            ]
            const [follow,like,comment] = await Promise.all(task);
            console.log(chalk`[{magenta ${timeNow}}] {cyanBright @${targetPerson.params.username}} => [Follow: ${follow}] [Like: ${like}] [Comment: ${comment}({cyan ${ranComment}})]`);
          } else {
            console.log(chalk`[{magenta ${timeNow}}] {cyanBright @${targetPerson.params.username}} => SKIPPED [PRIVATE]`);            
          }
        }));
        await insta.doSleep(answers.sleep, `Sleep for ${answers.sleep} MiliSeconds`);
      }
    } while(feeds.isMoreAvailable());
  } catch(e) {
    return Promise.reject(e);
  }
}

module.exports = followFollowersTarget;
