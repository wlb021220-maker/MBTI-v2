import { dimensionExplanations } from '../data/mbtiData.js'

export function useMbtiCalculator() {
    // 计算MBTI类型
    const calculateMBTIType = (userAnswers) => {
        // 统计每个维度的得分
        const dimensionScores = {
            "E": 0, "I": 0,
            "S": 0, "N": 0,
            "T": 0, "F": 0,
            "J": 0, "P": 0
        };

        // 统计每个答案对应的维度得分
        Object.values(userAnswers).forEach(score => {
            if (dimensionScores.hasOwnProperty(score)) {
                dimensionScores[score]++;
            }
        });

        // 确定每个维度的倾向
        let mbtiType = "";

        // E/I维度
        mbtiType += dimensionScores["E"] >= dimensionScores["I"] ? "E" : "I";

        // S/N维度
        mbtiType += dimensionScores["S"] >= dimensionScores["N"] ? "S" : "N";

        // T/F维度
        mbtiType += dimensionScores["T"] >= dimensionScores["F"] ? "T" : "F";

        // J/P维度
        mbtiType += dimensionScores["J"] >= dimensionScores["P"] ? "J" : "P";

        return mbtiType;
    };

    // 计算维度结果
    const calculateDimensionResults = (mbtiType) => {
        const dimensions = [
            { title: "精力支配", values: ["E", "I"], selected: mbtiType[0] },
            { title: "认识世界", values: ["S", "N"], selected: mbtiType[1] },
            { title: "判断事物", values: ["T", "F"], selected: mbtiType[2] },
            { title: "生活态度", values: ["J", "P"], selected: mbtiType[3] }
        ];

        return dimensions.map(dim => ({
            ...dim,
            explanation: dimensionExplanations[dim.selected]
        }));
    };

    // 计算答案详情
    const calculateAnswersDetails = (questions, userAnswers) => {
        return questions.map(q => {
            const selectedScore = userAnswers[q.id];
            const selectedOption = q.options.find(opt => opt.score === selectedScore);

            return {
                id: q.id,
                question: q.question,
                selectedOption: selectedOption.text,
                score: selectedScore
            };
        });
    };

    return {
        calculateMBTIType,
        calculateDimensionResults,
        calculateAnswersDetails
    };
}