
require("dotenv").config();

const { Client, Collection } = require("discord.js");

const prefix = "!";

const { readdirSync } = require("fs");

const client = new Client({
    fetchAllMembers: true
});

const db = require("./database/database");

client.commands = new Collection();
client.aliases = new Collection();

let en_uso = [];

const files = readdirSync(__dirname + "/commands").filter(f => f.endsWith('.js'));

for (const file of files) {
    const cmdFile = require("./commands/" + file);
    client.commands.set(cmdFile.name, cmdFile);
    for (const alias of cmdFile.aliases) client.aliases.set(alias, cmdFile.name);
    console.log(`[FILES MANAGER] Loaded command ${file}`);
}


client.on("ready", () => {
    console.log(`[BOT MANAGER] ${client.user.tag} is ready to go!`);

})

client.on("message", (message) => {
   const args = message.content.slice(prefix.length).split(' ');

   const command = args.shift().toLowerCase();

   const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

   return message.channel.type === "md" ? 0
   : message.author.bot ? 0
   : !cmd ? 0
   : cmd.run(client, message, args, db, en_uso);
})

client.login(process.env.DISCORD_TOKEN);