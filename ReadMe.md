# Watchdog-Bot

Game server monitoring bot for Discord
Assumes Debian 12 in operation

## Required (Only once)

- <s>`npm` initialize</s> (Already applied)

  ```shell-session
  $ npm init
  $ npm install discord.js dotenv ini
  ```

- `.env` (Root directory)
  - BOT_TOKEN : Discord Application [Token](https://discord.com/developers/applications)
- `server.ini` (Root directory)
  > [Servers]  
  > exec user='> Game Name \*\*\`IP:Port\`\*\*'
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
