const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();

// Modifications pour le .env
const token = process.env.TOKEN;
const guildId = process.env.GUILD_ID;
const clientId = process.env.CLIENT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;
const ticketscatId = process.env.TICKETS_CAT_ID;
const accountChannelId = process.env.ACCOUNT_CHANNEL_ID;
const addAccountChannelId = process.env.ADD_ACCOUNT_CHANNEL_ID;
const addFriendChannelId = process.env.ADD_FRIEND_CHANNEL_ID;
const ticketChannelId = process.env.TICKET_CHANNEL_ID;
const devChannelId = process.env.DEV_CHANNEL_ID;
const antterznUserId = process.env.ANTTERZN_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log('/dev is available');
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        if (interaction.commandName === 'dev') {
            await interaction.reply({ content: 'Your request is being sent', ephemeral: true });

            const embed = new EmbedBuilder()
                .setColor('#006CFF')
                .setTitle('Need a developer for something?')
                .setDescription(`You need to develop a website, or a mobile app or anything? I'm a young developer and I'm looking for some missions. I know a few programming languages but you can ask me everything because I learn fast.`)
                .addFields(
                    { name: 'My languages:', value: 'Python, HTML | CSS, JavaScript (with APIs like discord.js), Swift, Hardware (Arduino) and many others' },
                    { name: 'How to contact me', value: `You can contact me via the <#${devChannelId}> channel, or you can send a private message to <@${antterznUserId}>. You can also send me an email to aterzn@gmail.com.` }
                )
                .setThumbnail('https://drive.google.com/file/d/1AFRDewjHspokJ_1p_4_XnemXZ3o_tFyt/view?usp=sharing');

            try {
                const channel = await client.channels.fetch(devChannelId);
                if (channel) {
                    await channel.send({ embeds: [embed] });
                } else {
                    console.error('Channel not found');
                }
            } catch (error) {
                console.error('Error fetching the channel:', error);
            }
        }
    }
});

client.login(token);
