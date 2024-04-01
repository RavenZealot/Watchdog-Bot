const { spawn } = require('child_process');

const FS = require('fs');
const INI = require('ini');

const logger = require('../utils/logger');
const messenger = require('../utils/messenger');

module.exports = {
    data: {
        name: 'list',
        description: '稼働しているゲームサーバのリストを表示します．',
        type: 1
    },

    async execute(interaction) {
        try {
            // interaction の返信を遅延させる
            await interaction.deferReply({ ephemeral: true });

            // グローバルIPを取得
            const publicIp = await import('public-ip');
            const ip = await publicIp.publicIpv4();

            // ps コマンドを実行して .x86_64 プロセスを取得し，ユーザ名を抽出
            const ps = spawn('ps', ['aux']);
            const grep1 = spawn('grep', ['.x86_64']);
            const grep2 = spawn('grep', ['-v', 'grep']);
            const awk = spawn('awk', ['{print $1}']);

            ps.stdout.pipe(grep1.stdin);
            grep1.stdout.pipe(grep2.stdin);
            grep2.stdout.pipe(awk.stdin);

            let stdout = '';
            awk.stdout.on('data', (data) => {
                stdout += data;
            });

            awk.on('close', (code) => {
                if (code !== 0) {
                    logger.errorToFile(`ps コマンドの実行でエラーが発生`, new Error(`awk exited with code ${code}`));
                    return;
                }

                const servers = stdout.split('\n').filter(server => server.trim() !== '');
                let message = '現在稼働しているゲームサーバはありません';
                if (servers.length !== 0) {
                    const config = INI.parse(FS.readFileSync(`./server_list.ini`, 'utf-8'));
                    const serverList = servers.map(server => config.Servers[server].replace('GlobalIP', ip)).filter(Boolean);

                    message = `現在稼働しているゲームサーバは以下の通りです\n${serverList.join('\n')}`;
                }
                interaction.editReply(`${messenger.answerMessages(message)}\r\n`);
                logger.logToFile(`一覧 : ${message}`);
            });
        } catch (error) {
            await interaction.editReply(`${messenger.errorMessages(`ゲームサーバの取得でエラーが発生しました`)}`);
            logger.errorToFile(`ゲームサーバの取得でエラーが発生`, error);
        }
    }
};