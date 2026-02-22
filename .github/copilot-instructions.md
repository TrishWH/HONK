<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# HONK Copilot Extension

This is a VS Code extension project that creates a Copilot Chat participant called `@honk`.

## Project Context
- HONK is an "Emotional Support Goose" - a chat agent that helps users recognize anxiety spirals
- It has a direct, slightly sarcastic personality (not overly therapeutic)
- It maintains user-controlled memory (wins, triggers, helps, profile)

## Key Files
- `src/extension.ts` - Main extension with chat participant handlers
- `package.json` - Extension manifest with chat participant registration

## VS Code APIs Used
- `vscode.chat.createChatParticipant` - Register the @honk participant
- `vscode.LanguageModelChatMessage` - Build prompts for Copilot's model
- `request.model.sendRequest` - Send requests to Copilot's language model
- `stream.markdown` - Stream responses back to the chat

## Commands
- `/spiral` - Help identify spiraling
- `/wins` - Show saved wins
- `/help` - Show coping strategies  
- `/remember` - Save new memories
- `/forget` - Remove memories

This is a VS Code extension project. Please use the get_vscode_api with a query as input to fetch the latest VS Code API references.
