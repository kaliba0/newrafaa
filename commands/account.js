const { Client, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionType, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
require('dotenv').config();
const { startInactivityTimer, handleTicketActivity } = require('./fonctions/tickets/inactiveTicketManager'); // Importez les fonctions d'inactivité


// Variables d'environnement
const token = process.env.TOKEN;
const guildId = process.env.GUILD_ID;
const clientId = process.env.CLIENT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;
const ticketscatId = process.env.TICKETS_CAT_ID;
const addAccountChannelId = process.env.ADD_ACCOUNT_CHANNEL_ID;
const tierAId= process.env.ACCOUNT_A_CHANNEL_ID;
const tierBId= process.env.ACCOUNT_B_CHANNEL_ID;
const tierCId= process.env.ACCOUNT_C_CHANNEL_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log('/account is available');
});

let accountChannelNumber = 6;

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        if (interaction.commandName === 'account') {
            if (!interaction.member.roles.cache.has(adminRoleId)) {
                await interaction.reply({ content: 'You do not have the required permissions to use this command.', ephemeral: true });
                return;
            }

            if (interaction.channelId !== addAccountChannelId) {
                await interaction.reply({ content: 'This command can only be used in the add-account channel.', ephemeral: true });
                return;
            }

            const image = interaction.options.getAttachment('image');

            try {
                const button = new ButtonBuilder()
                    .setCustomId('accountButton')
                    .setLabel('Configure Account')
                    .setStyle(ButtonStyle.Primary);

                const row = new ActionRowBuilder().addComponents(button);

                // Répondre à l'interaction avec le bouton
                await interaction.reply({ content: 'Click the button to open the modal:', components: [row] });

                // Stocker l'image de manière temporaire
                client.imageAttachment = image;
                if (client.imageAttachment) {
                    console.log("Image correctement stockée:", client.imageAttachment.url);
                } else {
                    console.log("Aucune image n'a été stockée.");
                }

            } catch (error) {
                console.error('Erreur lors de l\'envoi du message avec le bouton:', error);
                await interaction.reply({ content: 'Une erreur s\'est produite lors de l\'envoi du message.', ephemeral: true });
            }
        }
    } else if (interaction.isButton() && interaction.customId === 'accountButton') {
        try {
            const modal = new ModalBuilder()
                .setCustomId('accountModal')
                .setTitle('Account Information');

            const price = new TextInputBuilder()
                .setCustomId('price')
                .setLabel('Price')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const trophies = new TextInputBuilder()
                .setCustomId('trophies')
                .setLabel('Trophies')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const rank35 = new TextInputBuilder()
                .setCustomId('rank35')
                .setLabel('Rank 35')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const rank30 = new TextInputBuilder()
                .setCustomId('rank30')
                .setLabel('Rank 30')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const description = new TextInputBuilder()
                .setCustomId('description')
                .setLabel('Description')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false);

            modal.addComponents(
                new ActionRowBuilder().addComponents(price),
                new ActionRowBuilder().addComponents(trophies),
                new ActionRowBuilder().addComponents(rank35),
                new ActionRowBuilder().addComponents(rank30),
                new ActionRowBuilder().addComponents(description)
            );

            await interaction.showModal(modal);
        } catch (error) {
            console.error('Erreur lors de l\'envoi du modal:', error);
            await interaction.reply({ content: 'Une erreur s\'est produite lors de l\'ouverture du modal.', ephemeral: true });
        }
    } else if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'accountModal') {
        try {
            const price = interaction.fields.getTextInputValue('price');
            const trophies = interaction.fields.getTextInputValue('trophies');
            const rank35 = interaction.fields.getTextInputValue('rank35') || '0';
            const rank30 = interaction.fields.getTextInputValue('rank30') || '0';
            const description = interaction.fields.getTextInputValue('description') || '';

            if (isNaN(price) || price.trim() === "") {
                await interaction.reply({ content: 'Please enter a valid number for the price.', ephemeral: true });
                return;
            }

            let targetChannelId;
            const numericPrice = parseFloat(price);

            if (numericPrice <= 100) {
                targetChannelId = tierCId;
            } else if (numericPrice > 100 && numericPrice <= 200) {
                targetChannelId = tierBId;
            } else {
                targetChannelId = tierAId;
            }

            const embed = new EmbedBuilder()
                .setTitle('‼️ A NEW ACCOUNT IS FOR SALE ‼️')
                .setColor('#FF0000')
                .addFields(
                    { name: ':moneybag: Price', value: `${price}€`, inline: true },
                    { name: '<:bstrophy:1275073059400978465> Trophies', value: `${trophies} <:bstrophy:1275073059400978465>`, inline: true },
                    { name: '<:rank35:1275072588934283345> Ranks 35', value: `${rank35}`, inline: true },
                    { name: '<:rank30:1275072757792510034> Ranks 30', value: `${rank30}`, inline: true },
                );

            if (description) {
                embed.setDescription(description);
            }

            if (client.imageAttachment && client.imageAttachment.url) {
                console.log("URL de l'image utilisée dans l'embed:", client.imageAttachment.url);
                embed.setImage(client.imageAttachment.url);
                client.imageAttachment = null;
            } else {
                console.log("URL de l'image non utilisée dans l'embed")
            }
            

            const buyButton = new ButtonBuilder()
                .setCustomId('buyButton')
                .setLabel('🎟️ Buy this account')
                .setStyle(ButtonStyle.Primary);

            const markAsSoldButton = new ButtonBuilder()
                .setCustomId('markAsSoldButton')
                .setLabel('Mark this account as sold')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(buyButton, markAsSoldButton);

            const targetChannel = client.channels.cache.get(targetChannelId);
            if (!targetChannel) {
                console.error('Salon cible introuvable.');
                await interaction.reply({ content: 'Le salon cible est introuvable. Veuillez vérifier la configuration.', ephemeral: true });
                return;
            }

            await targetChannel.send({ embeds: [embed], components: [row] });

            await interaction.reply({ content: `Votre récapitulatif a été envoyé dans le salon <#${targetChannel.id}>.`, ephemeral: true });
        } catch (error) {
            console.error('Erreur lors de l\'envoi du récapitulatif:', error);
            await interaction.reply({ content: 'Une erreur s\'est produite lors de l\'envoi du récapitulatif. Veuillez réessayer.', ephemeral: true });
        }
    } else if (interaction.isButton() && interaction.customId === 'markAsSoldButton') {
        if (!interaction.member.roles.cache.has(adminRoleId)) {
            await interaction.reply({ content: 'You do not have the required permissions to use this button.', ephemeral: true });
            return;
        }

        try {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('buyButton')
                    .setLabel('This account has been sold')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(true)
            );

            await interaction.update({ components: [row] });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'annonce:', error);
            await interaction.reply({ content: 'Une erreur s\'est produite lors de la mise à jour de l\'annonce.', ephemeral: true });
        }
    } else if (interaction.isButton() && interaction.customId === 'buyButton') {
        try {
            const guild = interaction.guild;

            accountChannelNumber += 1;
            const buyer = interaction.user.displayName;
            const ticketChannel = await guild.channels.create({
                name: `account-${accountChannelNumber}`,
                type: ChannelType.GuildText,
                parent: ticketscatId,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory
                        ],
                    },
                    {
                        id: adminRoleId,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory
                        ],
                    },
                ],
            });

            const recapEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Ticket Summary')
                .setDescription(buyer)
                .addFields(
                    { name: 'Service', value: 'Purchase Account', inline: false },
                    { name: ':moneybag: Price', value: interaction.message.embeds[0].fields[0].value, inline: true },
                    { name: '<:bstrophy:1275073059400978465> Trophies', value: interaction.message.embeds[0].fields[1].value, inline: true },
                    { name: '<:rank35:1275072588934283345> Ranks 35', value: interaction.message.embeds[0].fields[2].value, inline: true },
                    { name: '<:rank30:1275072757792510034> Ranks 30', value: interaction.message.embeds[0].fields[3].value, inline: true }
                );

            if (interaction.message.embeds[0].image) {
                recapEmbed.setImage(interaction.message.embeds[0].image.url);
            }

            await ticketChannel.send({ embeds: [recapEmbed] });

            startInactivityTimer(ticketChannel);

            await interaction.reply({ content: `✅ Vous avez choisi d'acheter ce compte. Vous pouvez suivre votre demande dans <#${ticketChannel.id}>.`, ephemeral: true });
        } catch (error) {
            console.error('Erreur lors de la création du salon de ticket:', error);
            await interaction.reply({ content: 'Une erreur s\'est produite lors de la création du salon de ticket. Veuillez réessayer.', ephemeral: true });
        }
    }
});

client.on('messageCreate', async message => {
    if (message.channel.parentId === ticketscatId) {
        handleTicketActivity(message.channel);
    }
});

client.login(token);
