const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();

// Modifications pour le .env
const token = process.env.TOKEN
const adminRoleId = process.env.ADMIN_ROLE_ID;
const devChannelId = process.env.DEV_CHANNEL_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log('/dev is available');
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        if (interaction.commandName === 'dev') {
            
            if (!interaction.member.roles.cache.has(adminRoleId)) {
                await interaction.reply({ content: 'You do not have the required permissions to use this command.', ephemeral: true });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#006CFF')
                .setTitle('Looking for a Developer to Bring Your Ideas to Life?')
                .setDescription(`I'm a young, passionate developer, constantly improving my skills and ready to take on new challenges. Whether you need a website, a mobile app, or a unique software solution, I'm here to make it happen! My learning curve is steep, and I'm eager to dive into new projects with enthusiasm.`)
                .addFields(
                    { name: 'My Languages and Skills:', value: 'I have experience with Python, HTML | CSS, JavaScript (especially with Discord.js), Swift for iOS, and hardware programming with Arduino. I’m quick to pick up new languages and technologies to meet project needs.' },
                    { name: 'Why Choose Me?', value: 'With a knack for problem-solving and a love for technology, I approach each project with fresh ideas and a tailored approach to bring your vision to life. I’m always open to learning and adapting to ensure high-quality results.' },
                    { name: 'Get in Touch', value: `Feel free to reach out in the <#${devChannelId}> channel or send a direct message to <@723555757638942853>. Alternatively, you can contact me by email at antterzn.dev@gmail.com. Let's create something amazing together!` },
                    { name: 'My Website', value: `You can check  [**the product page of my website ANTTERZN DEV**](https://dev.antterzn.fr/products.html) to know what I sell or [**me.antterzn.fr**](https://me.antterzn.fr) to learn more about me` }
                    
                )
                .setThumbnail('https://pics.paypal.com/00/s/MTMxNlgxNzUzWFBORw/p/OWNiMjZiYzItNDI3Zi00OTcyLTg1OTgtNDUwM2FhOWJkNDE1/image_58.jpg');

            await interaction.channel.send({ embeds: [embed] });

            await interaction.deferReply({ ephemeral: true });
            await interaction.deleteReply();
        }
    }
});

client.login(token);
