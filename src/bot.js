const { 
    Client, 
    GatewayIntentBits, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder 
} = require('discord.js');
const express = require('express');
const dotenv = require('dotenv');

const app = express();
app.use(express.json());

dotenv.config();
const token = process.env.DISCORD_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let pendingActions = [];

app.get('/get-actions', (req, res) => {
    res.json(pendingActions);
    pendingActions = [];
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const [action, commentId] = interaction.customId.split('_');

    pendingActions.push({ id: commentId, action: action });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('processed')
            .setLabel(action === 'rem' ? 'Removed' : 'Approved')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
    );

    await interaction.update({
        content: `Request sent to Reddit for \`${commentId}\`...`,
        components: [row]
    });
});

client.on('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}!`);
});

app.listen(3000, () => console.log('Proxy Server/Bot live on port 3000'));
client.login(token);