# Watchdog-Bot

Game server monitoring bot for Discord  
Assumes Debian 12 in operation

## Required (Only once)

- `.env` (Root directory)
  - BOT_TOKEN : Discord Application [Token](https://discord.com/developers/applications)
  - SERVER_EMOJI : Emoji for Server (e.g. `<:Debian:1234567890123456789>`)
- `server.ini` (Root directory)
  > [Servers]  
  > {exec user}='> {Game Name} \*\*\`GlobalIP:{Port}\`\*\*'
  - `{exec user}` : User to execute the command, e.g. `terraria`
  - `{Game Name}` : Game name, e.g. `Terraria`
  - `{Port}` : Game server port, e.g. `7777`
  - Example
    > [Servers]  
    > terraria='> Terraria \*\*\`GlobalIP:7777\`\*\*'
- Discord Application Generated URL

## Run

```shell-session
$ node bot/index.js
```

## Requests for developer (Optional)

In VS Code

1. Use [`Commit Message Editor`](https://marketplace.visualstudio.com/items?itemName=adam-bender.commit-message-editor) extention
   - Import `comit_template.json`
   - Use `Commit Message Editor` for messages when creating commits.
