module.exports = {
    // 回答メッセージを生成
    answerMessages: function (emoji, answer) {
        return `${emoji} : ${answer.trim()}`;
    },

    // エラーメッセージを生成
    errorMessages: function (answer, error) {
        return `:warning: **エラー** : ${answer} :warning:\n\`\`\`${error}\`\`\``;
    }
};