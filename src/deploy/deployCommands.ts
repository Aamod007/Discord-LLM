import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";

const BOT_TOKEN = process.env.DISCORD_LLM_BOT_TOKEN; 
const CLIENT_ID = process.env.DISCORD_LLM_BOT_CLIENT_ID;

const deploy = async () => {
    const commands = [];
    const foldersPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(foldersPath);
    
    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
    
    const rest = new REST().setToken(BOT_TOKEN ?? "");
    
    (async () => {
        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);
    
            const data: any = await rest.put(
                Routes.applicationCommands(CLIENT_ID ?? ""),
                { body: commands }
            );
    
            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            
            console.error(error);
        }
    })();
}



export default deploy;
