const inquirer = require('inquirer');
const rp = require('request-promise');
const insta = require('../func.js');
const Client = require('instagram-private-api').V1;
const _ = require('lodash');
const chalk = require('chalk');

const followAccountByHastag = async (session) => {
    const question = [
    {
      type:'input',
      name:'hastag',
      message:'Insert Hastag Target (Without #)',
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
    const commentArray = answers.text.split('|');
    const feed = new Client.Feed.TaggedMedia(session, answers.hastag);
    console.log('');
    var cursor;
    do {
      if (cursor) feed.setCursor(cursor);
      var media = await feed.get();
      media = _.chunk(media, 5);
      for (media of media) {
        await Promise.all(media.map(async(media)=>{
          var timeNow = new Date();
          timeNow = `${timeNow.getHours()}:${timeNow.getMinutes()}:${timeNow.getSeconds()}`
          const ranComment = _.sample(commentArray);
          insta.setTargetId(media.account.id);
          const task = [
            insta.doFollow() ? chalk`{bold.green SUKSES}` : chalk`{bold.red GAGAL}`,
            insta.doLike(media.params.id) ? chalk`{bold.green SUKSES}` : chalk`{bold.red GAGAL}`,
            insta.doComment(media.params.id, ranComment) ? chalk`{bold.green SUKSES}` : chalk`{bold.red GAGAL}`
          ]
          const [follow,like,comment] = await Promise.all(task);
          console.log(chalk`[{magenta ${timeNow}}] @{cyanBright @${media.params.user.username}} => [WebLink: ${media.params.webLink}] [Follow: ${follow}] [Like: ${like}] [Comment: ${comment}({cyan ${ranComment}})]`);
        }));
        await insta.doSleep(answers.sleep, `Sleep for ${answers.sleep} MiliSeconds`);
      }
    } while(feed.isMoreAvailable());
  } catch(err) {
    return Promise.reject(err);
  }
}

module.exports = followAccountByHastag;
