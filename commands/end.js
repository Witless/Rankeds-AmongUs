const { MessageEmbed } = require("discord.js");

const curl = require("curl");
const http = require("axios");

module.exports = {
    name: "terminar",
    aliases: ["acabar", "end", "finish"],
    run: async (client, message, args, db, en_uso) => {
        if (!message.member.voice.channel) return message.channel.send("No estás en ningún canal de voz");
        const players = await db.getMatch(message.member.voice.channelID)
            .then((players) => players)
            .catch(() => false);

        if (!players) return message.channel.send("No hay ninguna partida asociada a este canal de voz");

        if(!en_uso.includes(message.member.voice.channel.id))
            en_uso.push(message.member.voice.channel.id);
        else
            return;

        const crewMatesColors = message.guild.emojis.cache.filter((e) => e.name.endsWith("crew_mate")).map((e) => `<:${e.name}:${e.id}>`);
        if (crewMatesColors.length !== 10) return message.channel.send("Los emojis para las votaciones no han sido añadidos")

        const usersToVote = [], idsToVote = [], votingList = [];

        for (const player of players) {
            const member = message.guild.members.cache.get(player);
            if (!(member || message.member.voice.channel.members.has(player))) continue;
            usersToVote.push(member.user.tag);
            idsToVote.push(member.user.id);
        }

        const usersEmojis = {};

        for (let i = 0; i < 10; i++) {
            votingList.push(`${crewMatesColors[i]} ${usersToVote[i]}`);
            Object.defineProperty(usersEmojis, crewMatesColors[i], { value: idsToVote[i] });
        }

        const msg = await message.channel.send(
`**Votaciones del canal ${message.member.voice.channel.name}**\nPor favor, haced bien las votaciones. Si han ganado los impostores, votadles solo a ellos.
De igual manera, si ha ganado la tripulación, no votéis a los impostores
Recordad, los colores de las votaciones no están vinculados con los colores en el juego.\n\n${votingList.join("\n")}`);

        for (const emoji of crewMatesColors){
            msg.react(emoji.match(/(\d+)/)[0]);
        }
        console.log(message.member.voice.channel.members.has(message.author.id))
        const filter = (reaction, user) => {
            console.log(user)
            return crewMatesColors.includes(`<:${reaction.emoji.name}:${reaction.emoji.id}>`) &&  message.member.voice.channel.members.has(user.id) && !user.bot && message.client.user.id !== user.id
        };

        const collected = await msg.awaitReactions(filter, { time: 60000 })

            .then((coll) => coll)
            .catch(() => false);

        console.log(collected);

        if (!collected) return message.channel.send("Ha ocurrido un error al contar las reacciones");

        for (const reaction of collected.values()) {

            if (reaction.count < Math.floor(message.member.voice.channel.members.size * 0.6) + 1) continue;



            await curl.get(`${process.env.API_URL}/api/v1/auth=${process.env.API_TOKEN}/topID=${process.env.TOP_ID}/key=${usersEmojis[`<:${reaction.emoji.name}:${reaction.emoji.id}>`]}`, (err,res,body) => {
                let response = JSON.parse(body).res

                  if (response === "1")
                      http.patch(`${process.env.API_URL}/api/v1/auth=${process.env.API_TOKEN}/topID=${process.env.TOP_ID}/key=${usersEmojis[`<:${reaction.emoji.name}:${reaction.emoji.id}>`]}`);
                  else if (response === "-2")
                      http.post(`${process.env.API_URL}/api/v1/auth=${process.env.API_TOKEN}/topID=${process.env.TOP_ID}/key=${usersEmojis[`<:${reaction.emoji.name}:${reaction.emoji.id}>`]}/value=1`);

                })


        }

        message.member.voice.channel.edit({ userLimit: 10 }).then(()=>{
            db.delMatch(message.member.voice.channel.id).then(()=>{
                message.channel.send("Enhorabuena a los ganadores, vuestros puntos han sido sumados").then(() => {
                    const index = en_uso.indexOf(message.member.voice.channel.id);
                    if (index > -1) {
                        en_uso.splice(index, 1);
                    }
                })
            })
        })



    }
}