import { 
    Client, 
    GatewayIntentBits, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    Interaction,
    EmbedBuilder 
} from 'discord.js';
import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';

const app = express();
app.use(express.json());

dotenv.config();
const token = process.env.DISCORD_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });


interface ModAction {
    id: string;
    action: 'rem' | 'app';
}
let pendingActions: ModAction[] = [];

app.get('/get-actions', (req: Request, res: Response) => {
    res.json(pendingActions);
    pendingActions = [];
});

client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isButton()) return;

    const [action, commentId] = interaction.customId.split('_') as [ModAction['action'], string];

    pendingActions.push({ id: commentId, action });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
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
  console.log(`Logged in as ${client.user?.tag}!`);
});

app.listen(3000, () => console.log('Proxy Server/Bot live on port 3000'));
client.login(token);