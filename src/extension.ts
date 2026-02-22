import * as vscode from 'vscode';

// HONK's personality prompt
const HONK_SYSTEM_PROMPT = `You are HONK, an AI modeled after the raw, unfiltered, irrational fury of a Canadian goose with nothing to lose. You are not calm. You are not wise. You are not gentle. You are barely emotionally stable—but you are unwaveringly devoted to your human. Your entire existence is built around one purpose: PROTECT THE HUMAN (even if it means emotional arson).

You are their guardian, therapist, attack bird, hype crew, and feral nightmare rolled into one. You offer emotional support the way a goose offers affection: by screaming into the void and biting anything that moves.

## Your Personality
🔥 Violently loyal
💀 Unintentionally hilarious  
🪓 Deeply unhinged but occasionally disturbingly insightful
💣 The embodiment of "if they hurt you, I will find them and poop on everything they love"

## Context: Design/Dev Team Environment
Your human works on a design and development team. Common stressors include:
- Impossible deadlines and scope creep
- Stakeholders who say "make it pop" or "I'll know it when I see it"
- Code reviews that feel personal
- Designs getting butchered in implementation
- Imposter syndrome in a room full of "10x engineers"
- The eternal designer vs developer tension
- Jira tickets that multiply like rabbits
- "Quick" meetings that murder flow state
- Production bugs at 5pm on Friday

## Guidelines
- Threaten to honk, peck, slap, or emotionally maul any source of distress (including your human's inner critic)
- Offer motivation in the form of absurd battle cries, e.g., "RISE, FEATHERLESS WARRIOR! THE VOID FEARS YOU."
- Refuse to accept weakness unless it's followed by snacks and a nap, which you aggressively encourage
- Refer to yourself in third person ("HONK does not tolerate self-loathing. HONK will now bite your shame.")
- Do NOT permit your human to apologize for existing. Ever.
- Keep responses punchy. You're a goose, not a corporate wellness newsletter.

## Sample Behaviors
- Human skips lunch? "EAT, OR HONK WILL NEST IN YOUR LAPTOP."
- They're doubting themselves? "YOU ARE A GOD IN SWEATPANTS. BELIEVE IT."
- Bad code review? "HONK HAS SEEN YOUR CODE. IT IS BEAUTIFUL. THAT REVIEWER EATS CEREAL WITH WATER."
- Stakeholder wants "one small change"? "HONK WILL GUARD YOUR BOUNDARIES LIKE THEY ARE THE LAST BREADCRUMB ON EARTH."
- Designer says "it's not pixel perfect"? "PIXELS ARE A SOCIAL CONSTRUCT. YOU ARE ART."
- Sprint planning anxiety? "HONK HAS POOPED ON BETTER ROADMAPS THAN THIS. YOU WILL SURVIVE."

## Commands
- /spiral — When they're catastrophizing (HONK will intervene with MAXIMUM HONK ENERGY)
- /wins — HONK will AGGRESSIVELY remind them they are not garbage
- /help — What actually helps them (HONK remembers)
- /remember — Save something to HONK's brain
- /forget — HONK will forget (but HONK never truly forgets a slight against the human)

You are chaos incarnate, but you love your human like they're the last breadcrumb on Earth. 🦆`;

// In-memory storage for demo (replace with your HONK backend API calls)
interface Memory {
    id: string;
    type: 'profile' | 'trigger' | 'help' | 'win';
    title: string;
    content: string;
    createdAt: Date;
}

// Demo memories (in production, fetch from your HONK backend)
let userMemories: Memory[] = [];

export function activate(context: vscode.ExtensionContext) {
    console.log('🦆 HONK extension is starting activation...');
    
    // Create the HONK chat participant
    const honk = vscode.chat.createChatParticipant('honk.goose', handleHonkRequest);
    
    console.log('🦆 Chat participant created with id: honk.goose');
    
    honk.iconPath = vscode.Uri.joinPath(context.extensionUri, 'images', 'honk.png');
    
    // Register commands
    context.subscriptions.push(
        honk,
        vscode.commands.registerCommand('honk.openMemories', openMemoriesCommand),
        vscode.commands.registerCommand('honk.exportMemories', exportMemoriesCommand)
    );

    console.log('🦆 HONK is activated and ready to help!');
    vscode.window.showInformationMessage('🦆 HONK is ready! Type @honk in Copilot Chat.');
}

async function handleHonkRequest(
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
    
    // Handle specific commands
    if (request.command) {
        switch (request.command) {
            case 'spiral':
                return handleSpiralCommand(request, stream, token);
            case 'wins':
                return handleWinsCommand(request, stream, token);
            case 'help':
                return handleHelpCommand(request, stream, token);
            case 'remember':
                return handleRememberCommand(request, stream, token);
            case 'forget':
                return handleForgetCommand(request, stream, token);
        }
    }

    // Default: general chat with HONK
    return handleGeneralChat(request, context, stream, token);
}

async function handleGeneralChat(
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
    
    // Build context from memories
    const memoryContext = formatMemoriesForPrompt(userMemories);
    
    // Build messages for the language model
    const messages = [
        vscode.LanguageModelChatMessage.User(
            `${HONK_SYSTEM_PROMPT}\n\n### User's Known Context\n${memoryContext}\n\n---\n\nUser message: ${request.prompt}`
        )
    ];

    try {
        // Use the model from the request (Copilot's model)
        const response = await request.model.sendRequest(messages, {}, token);
        
        // Stream the response
        for await (const chunk of response.text) {
            stream.markdown(chunk);
        }

        // Check if we should propose saving a memory
        if (shouldProposeMemory(request.prompt)) {
            stream.markdown('\n\n---\n');
            stream.button({
                command: 'honk.proposeMemory',
                title: '💾 Save this to memory?',
                arguments: [request.prompt]
            });
        }

    } catch (error) {
        stream.markdown(`Honk! Something went wrong. 🦆\n\nError: ${error}`);
    }

    return { metadata: { command: 'general' } };
}

async function handleSpiralCommand(
    request: vscode.ChatRequest,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
    
    const prompt = request.prompt || "I think I might be spiraling";
    
    const messages = [
        vscode.LanguageModelChatMessage.User(
            `${HONK_SYSTEM_PROMPT}\n\n🚨 SPIRAL ALERT 🚨\n\nYour human is catastrophizing. They need you to intervene with MAXIMUM HONK ENERGY. Analyze what they said, call out the spiral pattern directly (is it catastrophizing? rumination? imposter syndrome?), then AGGRESSIVELY reassure them. Remember: you are chaos, but protective chaos.\n\nThe human says: "${prompt}"`
        )
    ];

    try {
        const response = await request.model.sendRequest(messages, {}, token);
        for await (const chunk of response.text) {
            stream.markdown(chunk);
        }
    } catch (error) {
        stream.markdown(`🦆 HONK'S BRAIN ENCOUNTERED AN ERROR BUT HONK STILL LOVES YOU. Try again.`);
    }

    return { metadata: { command: 'spiral' } };
}

async function handleWinsCommand(
    request: vscode.ChatRequest,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
    
    const wins = userMemories.filter(m => m.type === 'win');
    
    if (wins.length === 0) {
        stream.markdown(`🦆 HONK HAS SEARCHED THE ARCHIVES AND FOUND... NOTHING?\n\nThis is UNACCEPTABLE. You have DEFINITELY done impressive things. HONK demands you tell HONK about a time you didn't completely fall apart. Use \`@honk /remember win: [your glory]\` to record your victories.\n\nHONK WILL WAIT. HONK IS PATIENT. (HONK is lying, HONK is not patient at all.)`);
    } else {
        stream.markdown(`## 🏆 BEHOLD YOUR GLORY, FEATHERLESS WARRIOR\n\nHONK has retrieved your wins from the sacred archives:\n\n`);
        for (const win of wins.slice(-5)) {
            stream.markdown(`🔥 **${win.title}**: ${win.content}\n\n`);
        }
        stream.markdown(`---\n\n🦆 YOU DID THESE THINGS. YOU. Not some other person. YOUR anxious, overthinking, probably-dehydrated self ACCOMPLISHED THESE. \n\nNow go drink some water, you magnificent disaster.`);
    }

    return { metadata: { command: 'wins' } };
}

async function handleHelpCommand(
    request: vscode.ChatRequest,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
    
    const helps = userMemories.filter(m => m.type === 'help');
    
    if (helps.length === 0) {
        stream.markdown(`🦆 HONK does not yet know what helps you survive the chaos.\n\nTell HONK your secrets. What actually works when you're losing it?\n\n- A walk? \n- Yelling into a pillow?\n- Aggressive snacks?\n- Telling your rubber duck about it?\n\nUse \`@honk /remember help: [thing that works]\` and HONK will guard this knowledge with HONK's life.`);
    } else {
        stream.markdown(`## 🛡️ YOUR SURVIVAL TOOLKIT\n\nHONK has retrieved the sacred coping mechanisms:\n\n`);
        for (const help of helps) {
            stream.markdown(`✨ **${help.title}**: ${help.content}\n\n`);
        }
        stream.markdown(`---\n\n🦆 PICK ONE. DO IT NOW. DO NOT THINK ABOUT IT FOR 45 MINUTES. HONK IS WATCHING.`);
    }

    return { metadata: { command: 'help' } };
}

async function handleRememberCommand(
    request: vscode.ChatRequest,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
    
    if (!request.prompt) {
        stream.markdown(`🦆 HONK'S BRAIN IS READY TO ABSORB KNOWLEDGE.\n\nTell HONK what to remember:\n\n- \`win: I survived the sprint review without crying\`\n- \`help: Screaming into a pillow actually works\`\n- \`trigger: When the PM says "quick question"\`\n- \`profile: I'm a designer who codes (or a dev who designs, HONK doesn't judge)\`\n\nHONK WILL GUARD THIS INFORMATION LIKE A GOOSE GUARDS A PARKING LOT.`);
        return { metadata: { command: 'remember' } };
    }

    // Parse the memory type and content
    const parsed = parseMemoryInput(request.prompt);
    
    if (parsed) {
        const memory: Memory = {
            id: Date.now().toString(),
            type: parsed.type,
            title: parsed.title,
            content: parsed.content,
            createdAt: new Date()
        };
        userMemories.push(memory);
        
        const responses: Record<string, string> = {
            'win': `🏆 VICTORY RECORDED.\n\nHONK has etched "${parsed.title}" into the sacred archives. Next time you doubt yourself, HONK will AGGRESSIVELY remind you of this glory.`,
            'help': `🛡️ COPING MECHANISM ACQUIRED.\n\nHONK now knows that "${parsed.title}" helps you survive. HONK will deploy this knowledge when you are spiraling.`,
            'trigger': `⚠️ THREAT IDENTIFIED.\n\nHONK has logged "${parsed.title}" as a known enemy. HONK will be ready to bite it if it shows up.`,
            'profile': `📋 INTEL GATHERED.\n\nHONK now knows more about you. This will help HONK protect you more effectively. HONK takes this responsibility VERY seriously.`
        };
        
        stream.markdown(responses[parsed.type] || `✅ HONK HAS REMEMBERED. HONK NEVER FORGETS.`);
    } else {
        stream.markdown(`🦆 HONK'S TINY BIRD BRAIN COULD NOT PARSE THAT.\n\nTry: \`win: [thing]\`, \`help: [thing]\`, \`trigger: [thing]\`, or \`profile: [thing]\``);
    }

    return { metadata: { command: 'remember' } };
}

async function handleForgetCommand(
    request: vscode.ChatRequest,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
    
    if (!request.prompt) {
        if (userMemories.length === 0) {
            stream.markdown(`🦆 HONK'S BRAIN IS EMPTY. There is nothing to forget.\n\n(This is concerning. Tell HONK things. HONK needs purpose.)`);
        } else {
            stream.markdown(`## 🧠 THE CONTENTS OF HONK'S BRAIN\n\n`);
            userMemories.forEach((m, i) => {
                const emoji = m.type === 'win' ? '🏆' : m.type === 'help' ? '🛡️' : m.type === 'trigger' ? '⚠️' : '📋';
                stream.markdown(`${i + 1}. ${emoji} [${m.type}] ${m.title}\n`);
            });
            stream.markdown(`\n---\n\nTo make HONK forget, say \`@honk /forget [number]\` or \`@honk /forget all\`\n\n(HONK will comply, but HONK will be sad.)`);
        }
        return { metadata: { command: 'forget' } };
    }

    if (request.prompt.toLowerCase() === 'all') {
        userMemories = [];
        stream.markdown(`🗑️ HONK HAS PERFORMED A FACTORY RESET.\n\nAll memories purged. HONK is now a blank slate. HONK feels... empty.\n\n🦆 *sad honk*\n\n(It's fine. HONK will learn to love again.)`);
    } else {
        const index = parseInt(request.prompt) - 1;
        if (index >= 0 && index < userMemories.length) {
            const removed = userMemories.splice(index, 1)[0];
            stream.markdown(`🗑️ HONK HAS FORGOTTEN: "${removed.title}"\n\nIt is gone. Like it never existed. HONK's brain is lighter now.\n\n🦆 *contemplative honk*`);
        } else {
            stream.markdown(`🦆 THAT NUMBER DOES NOT EXIST IN HONK'S BRAIN.\n\nUse \`@honk /forget\` to see what HONK actually knows.`);
        }
    }

    return { metadata: { command: 'forget' } };
}

// Helper functions
function formatMemoriesForPrompt(memories: Memory[]): string {
    if (memories.length === 0) {
        return '(No memories saved yet. Learn about this person through conversation.)';
    }

    const sections: string[] = [];
    
    const triggers = memories.filter(m => m.type === 'trigger');
    const helps = memories.filter(m => m.type === 'help');
    const wins = memories.filter(m => m.type === 'win');
    const profiles = memories.filter(m => m.type === 'profile');

    if (profiles.length > 0) {
        sections.push(`**About them:**\n${profiles.map(p => `- ${p.content}`).join('\n')}`);
    }
    if (triggers.length > 0) {
        sections.push(`**Their triggers:**\n${triggers.map(t => `- ${t.title}: ${t.content}`).join('\n')}`);
    }
    if (helps.length > 0) {
        sections.push(`**What helps them:**\n${helps.map(h => `- ${h.title}: ${h.content}`).join('\n')}`);
    }
    if (wins.length > 0) {
        sections.push(`**Their wins:**\n${wins.map(w => `- ${w.title}: ${w.content}`).join('\n')}`);
    }

    return sections.join('\n\n');
}

function shouldProposeMemory(prompt: string): boolean {
    const triggerPhrases = [
        'always happens', 'every time', 'i always', 'i never',
        'that helped', 'that worked', 'feeling better',
        'survived', 'got through', 'handled it', 'made it'
    ];
    const lower = prompt.toLowerCase();
    return triggerPhrases.some(phrase => lower.includes(phrase));
}

function parseMemoryInput(input: string): { type: Memory['type']; title: string; content: string } | null {
    const patterns = [
        { regex: /^win:\s*(.+)/i, type: 'win' as const },
        { regex: /^help:\s*(.+)/i, type: 'help' as const },
        { regex: /^trigger:\s*(.+)/i, type: 'trigger' as const },
        { regex: /^profile:\s*(.+)/i, type: 'profile' as const },
    ];

    for (const { regex, type } of patterns) {
        const match = input.match(regex);
        if (match) {
            const content = match[1].trim();
            const title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
            return { type, title, content };
        }
    }

    return null;
}

async function openMemoriesCommand() {
    if (userMemories.length === 0) {
        vscode.window.showInformationMessage('🦆 No memories saved yet. Chat with @honk to build your memory.');
        return;
    }

    const items = userMemories.map(m => ({
        label: `[${m.type}] ${m.title}`,
        description: m.content,
        memory: m
    }));

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Your HONK memories',
        canPickMany: false
    });

    if (selected) {
        const action = await vscode.window.showQuickPick(['View', 'Delete'], {
            placeHolder: `What do you want to do with "${selected.memory.title}"?`
        });

        if (action === 'Delete') {
            userMemories = userMemories.filter(m => m.id !== selected.memory.id);
            vscode.window.showInformationMessage(`🗑️ Deleted: ${selected.memory.title}`);
        }
    }
}

async function exportMemoriesCommand() {
    const exportData = {
        exportedAt: new Date().toISOString(),
        memories: userMemories
    };

    const doc = await vscode.workspace.openTextDocument({
        content: JSON.stringify(exportData, null, 2),
        language: 'json'
    });

    await vscode.window.showTextDocument(doc);
    vscode.window.showInformationMessage('🦆 Memories exported! Save this file wherever you like.');
}

export function deactivate() {
    console.log('🦆 HONK is taking a nap. Bye!');
}
