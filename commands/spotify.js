//$spotify
//testing spotify web API
const {MessageEmbed, Message} = require('discord.js');
const fetch = require('node-fetch');

exports.commandName = 'spotify';

exports.run = async (client,message,args) => {
    let embed = new MessageEmbed()
    try{
        
    } catch (err){
        embed.setDescription(`Error: ${err}`);
        return;
    }
}