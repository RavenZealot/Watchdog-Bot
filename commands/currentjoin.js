const FS = require('fs').promises;
const { MessageFlags } = require('discord.js');

const logger = require('../utils/logger');
const messenger = require('../utils/messenger');

module.exports = {
    data: {
        name: 'currentjoin',
        description: 'ゲームサーバに参加しているユーザを表示します．',
        type: 1,
        options: [
            {
                name: '対象',
                description: '対象のゲームサーバを指定してください．',
                type: 3,
                required: true,
                choices: [
                    { name: 'Terraria', value: 'Terraria' },
                    { name: 'Valheim', value: 'Valheim' }
                ]
            },
            {
                name: '公開',
                description: '他のユーザに公開するかを選択してください．',
                type: 5,
                required: false
            }
        ]
    },

    async execute(interaction) {
        const debianEmoji = process.env.SERVER_EMOJI;
        try {
            // 対象を取得
            const target = interaction.options.getString('対象');
            // 公開設定を取得
            const isPublic = interaction.options.getBoolean('公開') ?? false;

            // interaction の返信を遅延させる
            await interaction.deferReply({ flags: !isPublic ? MessageFlags.Ephemeral : 0 });

            let logFilePath;
            switch (target) {
                case 'Terraria':
                    logFilePath = '/opt/terraria/terraria_server.log';
                    break;
                case 'Valheim':
                    logFilePath = '/opt/valheim/valheim_server.log';
                    break;
                default:
                    throw new Error(`未知の対象が選択されました : ${target}`);
            }

            const activeUsers = await getActiveUsers(logFilePath, target);

            let message = `現在 ${target} に接続しているユーザはいません`;
            if (activeUsers.length !== 0) {
                message = `現在 ${target} に接続しているユーザは以下の通りです\n${activeUsers.join(', ')}`;
            }

            await logger.logToFile(`参加 : ${message}`);
            await interaction.editReply(messenger.answerMessages(debianEmoji, message));
        } catch (error) {
            await logger.errorToFile('ユーザの取得でエラーが発生', error);
            await interaction.editReply(messenger.errorMessages('ユーザの取得でエラーが発生しました', error.message));
        }
    }
};

async function getActiveUsers(logFilePath, target) {
    const fileHandle = await FS.open(logFilePath, 'r');
    const fileStats = await fileHandle.stat();
    const fileSize = fileStats.size;

    // ログファイルの末尾から 10000 バイト分読み込む
    const bufferSize = Math.min(10000, fileSize);
    const buffer = Buffer.alloc(bufferSize);
    await fileHandle.read(buffer, 0, bufferSize, fileSize - bufferSize);
    await fileHandle.close();

    // バッファからログを取得
    const recentLogs = buffer.toString('utf-8').split('\n');

    // SteamID をキーとしてユーザー名を保存
    let users = new Map();

    for await (const line of recentLogs) {
        if (target === 'Terraria') {
            const joinMatch = line.match(/(.*) has joined\./);
            const leftMatch = line.match(/(.*) has left\./);

            if (joinMatch) {
                // 接続したユーザを追加
                users.set(joinMatch[1], joinMatch[1]);
            } else if (leftMatch) {
                // 切断したユーザを削除
                users.delete(leftMatch[1], leftMatch[1]);
            }
        }
        else if (target === 'Valheim') {
            const connectMatch = line.match(/Got connection SteamID (\d+)/);
            const disconnectMatch = line.match(/Closing socket (\d+)/);
            const nameMatch = line.match(/Got character ZDOID from (\w+) : -?\d+:\d+/);

            if (connectMatch) {
                // 接続したユーザを追加
                const steamId = connectMatch[1];
                users.set(steamId, users.get(steamId) || null);
            }
            if (disconnectMatch) {
                // 切断したユーザを削除
                const steamId = disconnectMatch[1];
                users.delete(steamId);
            }
            if (nameMatch) {
                // ユーザ名を関連付け
                const name = nameMatch[1];
                const steamId = Array.from(users.entries()).find(([_id, userName]) => userName === null)?.[0];
                if (steamId) {
                    users.set(steamId, name);
                }
            }
        }
    }

    return Array.from(users.values()).filter(Boolean);
};