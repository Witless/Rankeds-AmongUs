module.exports = {
    name: "empezar",
    aliases: ["comenzar", "start"],
    run: async (client, message, args, db) => {
        if (!message.member.voice.channel) return message.channel.send("No estás en ningún canal de voz");
        if (message.member.voice.channel.members.size !== 10) return message.channel.send("Debe de haber 10 personas en el canal de voz para comenzar");

        await db.getMatch(message.member.voice.channelID)
            .then(() =>  { return message.channel.send("La partida de este canal de voz ya ha empezado") })
            .catch(() => {
            db.newMatch(message.member.voice.channelID, message.member.voice.channel.members.map((m) => m.user.id))
            message.member.voice.channel.edit({ userLimit: 1 });
            message.channel.send("La partida puede comenzar. Usad el comando `acabar` al terminar la partida");
            });



    }
}