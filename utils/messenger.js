module.exports = {
    // 回答メッセージを生成
    answerMessages: function (answer) {
        return `:loudspeaker: : ${answer.trim()}`;
    },

    // エラーメッセージを生成
    errorMessages: function (error) {
        return `:warning: **エラー** : ${error} :warning:`;
    }
};