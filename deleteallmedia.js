const insta = require('../func.js');
const _ = require('lodash');
const chalk = require('chalk');

const deleteAllMedia = async () => {
  console.log('')
  try {
    insta.setTargetId();
    var media = await insta.getMedia();
    media = _.chunk(media, 8);
    for (media of media) {
      await Promise.all(media.map (async(media) => {
        const result = await insta.deleteMedia(media.id);
        console.log(`[{magenta ${media.id}}] {cyanBright ${media.webLink}} => ${result ? chalk`{bold.green SUKSES}` : `{bold.red GAGAL}`}`)
      }));
      await doSleep(30000, 'Sleep for 30000 MiliSeconds...');
    }
  } catch (e) {
    return Promise.reject(e);
  }
}

module.exports = deleteAllMedia;
