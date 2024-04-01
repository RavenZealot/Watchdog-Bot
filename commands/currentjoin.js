const readline = require('readline');

const FS = require('fs');

const logger = require('../utils/logger');
const messenger = require('../utils/messenger');

async function getActiveUsers(logFilePath, target) {
    const fileStream = FS.createReadStream(logFilePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let users = new Set();
    let steamIdToName = {};
    let lastSteamId = '';

    for await (const line of rl) {
        if (target === 'Terraria') {
            const joinMatch = line.match(/(.*) has joined\./);
            const leftMatch = line.match(/(.*) has left\./);

            if (joinMatch) {
                // 接続したユーザを追加
                users.add(joinMatch[1]);
            } else if (leftMatch) {
                // 切断したユーザを削除
                users.delete(leftMatch[1]);
            }
        }
        else if (target === 'Valheim') {
            const joinMatch = line.match(/Got connection SteamID (\d+)/);
            const leftMatch = line.match(/Closing socket (\d+)/);
            const nameMatch = line.match(/Got character ZDOID from (\w+) : \d+:\d+/);

            if (joinMatch) {
                lastSteamId = joinMatch[1];
            }
            if (nameMatch && lastSteamId) {
                steamIdToName[lastSteamId] = nameMatch[1];
                users.add(steamIdToName[lastSteamId]);
            }
            if (leftMatch) {
                users.delete(steamIdToName[leftMatch[1]] || leftMatch[1]);
            }
        }
    }

    return Array.from(users);
}

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
                    {
                        name: 'Terraria',
                        value: 'Terraria'
                    },
                    {
                        name: 'Valheim',
                        value: 'Valheim'
                    }
                ]
            },
            {
                name: '公開',
                description: '他のユーザに公開するかどうかを選択してください．',
                type: 5,
                required: false
            }
        ]
    },

    async execute(interaction) {
        try {
            // 対象を取得
            const target = interaction.options.getString('対象');
            // 公開設定を取得
            const isPublic = interaction.options.getBoolean('公開');

            // interaction の返信を遅延させる
            await interaction.deferReply({ ephemeral: !isPublic });

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

            await interaction.editReply(`${messenger.answerMessages(message)}\r\n`);
            logger.logToFile(`一覧 : ${message}`);
        } catch (error) {
            await interaction.editReply(`${messenger.errorMessages(`ユーザの取得でエラーが発生しました`, error.message)}`);
            logger.errorToFile(`ユーザの取得でエラーが発生`, error);
        }
    }
};