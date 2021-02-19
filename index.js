const ytpl = require('ytpl');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exit } = require('process');
const { format } = require('path');
const fluentffmpeg = require('fluent-ffmpeg');

var rl = readline.createInterface(process.stdin, process.stdout);

const settingsPath = './config.json';

var link;
var dir;
try{
    if(fs.existsSync(settingsPath)){
        const jsonString = fs.readFileSync(settingsPath, 'utf8');
        const config = JSON.parse(jsonString);
        link = config.link;
        dir = config.dir;
        download();
    } else{
        console.log('No config detected.');
        rl.question('Input link ', function(answer) {
            link = answer;
            rl.question('Input dir ', async function(answer){
                dir = answer;
                const config = {
                    "link": link,
                    "dir": dir,
                }
                const jsonString = JSON.stringify(config);
                fs.writeFileSync(settingsPath, jsonString);
                rl.close;
                await download();
            })
        })
    }
} catch(err){
    console.log(err);
}

async function download(){
    console.log(link);
    const playlist = await ytpl(link);
    playlist.items.forEach(element => {
        var filename = path.join(dir, element.title.replace(/[/\\?%*:|"<>]/g, '-') + '.mp3');
        if(fs.existsSync(filename)){
            console.log("Skipped " + element.title + "as it already exists.")
            return;
        }
        fluentffmpeg(ytdl(element.url,{'filter': 'audioonly'}))
            .audioCodec('libmp3lame')
            .save(filename)
            .on('end', () => {
                console.log(element.title + " downloaded")
            })
            .run()
        
    });
}

