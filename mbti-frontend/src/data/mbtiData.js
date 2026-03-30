// MBTI测试题库数据
export const mbtiQuestions = [
    // 第一部分：1-26题
    {
        id: 1,
        question: "当你某日想去一个地方，你会：",
        options: [
            { text: "事先计划好了，然后再去", score: "J" },
            { text: "先去，然后随机应变", score: "P" }
        ],
        section: 1
    },
    {
        id: 2,
        question: "如果你是一位老师，你愿教：",
        options: [
            { text: "注重实践的课程", score: "S" },
            { text: "注重理论的课程", score: "N" }
        ],
        section: 1
    },
    {
        id: 3,
        question: "遇到问题时，你通常喜欢：",
        options: [
            { text: "和别人讨论解决方法", score: "E" },
            { text: "自己想办法解决", score: "I" }
        ],
        section: 1
    },
    {
        id: 4,
        question: "你认为：",
        options: [
            { text: "很早就应该开始为聚会，约会等做准备", score: "J" },
            { text: "不必先做准备，去了以后见机行事", score: "P" }
        ],
        section: 1
    },
    {
        id: 5,
        question: "你通常和____相处得更好：",
        options: [
            { text: "喜欢想象的人", score: "N" },
            { text: "注重现实的人", score: "S" }
        ],
        section: 1
    },
    {
        id: 6,
        question: "你更多时候是：",
        options: [
            { text: "让情感驾驭理智", score: "F" },
            { text: "让理智驾驭情感", score: "T" }
        ],
        section: 1
    },
    {
        id: 7,
        question: "当你和一群人在一起时，你常常是更愿意：",
        options: [
            { text: "加入到大家的谈话中去", score: "E" },
            { text: "独自和熟识的人交谈", score: "I" }
        ],
        section: 1
    },
    {
        id: 8,
        question: "你最喜欢____做事情：",
        options: [
            { text: "按兴致", score: "P" },
            { text: "按计划", score: "J" }
        ],
        section: 1
    },
    {
        id: 9,
        question: "你希望自己被看作是一个：",
        options: [
            { text: "实干家", score: "S" },
            { text: "发明家", score: "N" }
        ],
        section: 1
    },
    {
        id: 10,
        question: "当别人问你一个问题时，你经常会：",
        options: [
            { text: "马上就做回答", score: "E" },
            { text: "先在脑子里想一想", score: "I" }
        ],
        section: 1
    },
    {
        id: 11,
        question: "你喜欢与____打交道：",
        options: [
            { text: "常有出人意料想法的人", score: "N" },
            { text: "按照常理行事的人", score: "S" }
        ],
        section: 1
    },
    {
        id: 12,
        question: "按日程表办事：",
        options: [
            { text: "正合你意", score: "J" },
            { text: "束缚了你", score: "P" }
        ],
        section: 1
    },
    {
        id: 13,
        question: "你觉得通常别人：",
        options: [
            { text: "要花很长的时间才能和你相熟", score: "I" },
            { text: "很快就能和你熟识", score: "E" }
        ],
        section: 1
    },
    {
        id: 14,
        question: "为如何过周末订一个计划：",
        options: [
            { text: "是有必要的", score: "J" },
            { text: "完全没必要", score: "P" }
        ],
        section: 1
    },
    {
        id: 15,
        question: "下列哪一个评价更适合你：",
        options: [
            { text: "性情中人", score: "F" },
            { text: "理智的人", score: "T" }
        ],
        section: 1
    },
    {
        id: 16,
        question: "更多的时候，你倾向于：",
        options: [
            { text: "独处", score: "I" },
            { text: "同他人在一起", score: "E" }
        ],
        section: 1
    },
    {
        id: 17,
        question: "在日常工作中，你更喜欢：",
        options: [
            { text: "在时间紧迫的情况下，争分夺秒地工作", score: "P" },
            { text: "做好提前量，尽早把工作做完", score: "J" }
        ],
        section: 1
    },
    {
        id: 18,
        question: "你更愿把____作为朋友：",
        options: [
            { text: "总能有新想法的人", score: "N" },
            { text: "脚踏实地的人", score: "S" }
        ],
        section: 1
    },
    {
        id: 19,
        question: "你是一个：",
        options: [
            { text: "兴趣广泛，什么都想尝试的人", score: "E" },
            { text: "专注的投入某个兴趣的人", score: "I" }
        ],
        section: 1
    },
    {
        id: 20,
        question: "当你有一项特别的工作要做时，你喜欢先：",
        options: [
            { text: "察看到工作的全貌", score: "J" },
            { text: "找出必须要做的环节", score: "P" }
        ],
        section: 1
    },
    {
        id: 21,
        question: "你更接受：",
        options: [
            { text: "以情动人", score: "F" },
            { text: "以理服人", score: "T" }
        ],
        section: 1
    },
    {
        id: 22,
        question: "当你为了消遣而阅读时，你：",
        options: [
            { text: "欣赏作者奇特、独创的表达", score: "N" },
            { text: "喜欢作者的表达直接、明确", score: "S" }
        ],
        section: 1
    },
    {
        id: 23,
        question: "新认识的人____了解到你的兴趣所在：",
        options: [
            { text: "马上就能", score: "E" },
            { text: "只有真正和你熟悉以后才能", score: "I" }
        ],
        section: 1
    },
    {
        id: 24,
        question: "在旅行时，你喜欢：",
        options: [
            { text: "随兴致行事", score: "P" },
            { text: "事先知道一天中该做的事", score: "J" }
        ],
        section: 1
    },
    {
        id: 25,
        question: "做许多人都做的事时，你喜欢：",
        options: [
            { text: "按惯例去做", score: "S" },
            { text: "发明自己的新方法", score: "N" }
        ],
        section: 1
    },
    {
        id: 26,
        question: "多数人说你是一个：",
        options: [
            { text: "不爱吐露心事的人", score: "I" },
            { text: "非常坦率的人", score: "E" }
        ],
        section: 1
    },

    // 第二部分：27-58题（词语选择类）
    {
        id: 27,
        question: "你更倾向或喜欢：",
        options: [
            { text: "看不见的", score: "N" },
            { text: "看的见的", score: "S" }
        ],
        section: 2
    },
    {
        id: 28,
        question: "你更倾向或喜欢：",
        options: [
            { text: "计划", score: "J" },
            { text: "随意", score: "P" }
        ],
        section: 2
    },
    {
        id: 29,
        question: "你更倾向或喜欢：",
        options: [
            { text: "温情", score: "F" },
            { text: "坚定", score: "T" }
        ],
        section: 2
    },
    {
        id: 30,
        question: "你更倾向或喜欢：",
        options: [
            { text: "事实", score: "S" },
            { text: "想法", score: "N" }
        ],
        section: 2
    },
    {
        id: 31,
        question: "你更倾向或喜欢：",
        options: [
            { text: "思维", score: "T" },
            { text: "情感", score: "F" }
        ],
        section: 2
    },
    {
        id: 32,
        question: "你更倾向或喜欢：",
        options: [
            { text: "热忱", score: "E" },
            { text: "平静", score: "I" }
        ],
        section: 2
    },
    {
        id: 33,
        question: "你更倾向或喜欢：",
        options: [
            { text: "说服", score: "T" },
            { text: "打动", score: "F" }
        ],
        section: 2
    },
    {
        id: 34,
        question: "你更倾向或喜欢：",
        options: [
            { text: "陈述", score: "S" },
            { text: "概念", score: "N" }
        ],
        section: 2
    },
    {
        id: 35,
        question: "你更倾向或喜欢：",
        options: [
            { text: "分析", score: "T" },
            { text: "同情", score: "F" }
        ],
        section: 2
    },
    {
        id: 36,
        question: "你更倾向或喜欢：",
        options: [
            { text: "系统性", score: "J" },
            { text: "随机性", score: "P" }
        ],
        section: 2
    },
    {
        id: 37,
        question: "你更倾向或喜欢：",
        options: [
            { text: "敏感", score: "F" },
            { text: "精确", score: "T" }
        ],
        section: 2
    },
    {
        id: 38,
        question: "你更倾向或喜欢：",
        options: [
            { text: "缄默", score: "I" },
            { text: "健谈", score: "E" }
        ],
        section: 2
    },
    {
        id: 39,
        question: "你更倾向或喜欢：",
        options: [
            { text: "常识性的", score: "S" },
            { text: "理论性的", score: "N" }
        ],
        section: 2
    },
    {
        id: 40,
        question: "你更倾向或喜欢：",
        options: [
            { text: "侠肝义胆", score: "F" },
            { text: "深谋远虑", score: "T" }
        ],
        section: 2
    },
    {
        id: 41,
        question: "你更倾向或喜欢：",
        options: [
            { text: "正式", score: "J" },
            { text: "非正式", score: "P" }
        ],
        section: 2
    },
    {
        id: 42,
        question: "你更倾向或喜欢：",
        options: [
            { text: "沉静", score: "I" },
            { text: "活跃", score: "E" }
        ],
        section: 2
    },
    {
        id: 43,
        question: "你更倾向或喜欢：",
        options: [
            { text: "利益", score: "T" },
            { text: "祝福", score: "F" }
        ],
        section: 2
    },
    {
        id: 44,
        question: "你更倾向或喜欢：",
        options: [
            { text: "理论性", score: "N" },
            { text: "确定性", score: "S" }
        ],
        section: 2
    },
    {
        id: 45,
        question: "你更倾向或喜欢：",
        options: [
            { text: "坚定的", score: "T" },
            { text: "忠诚的", score: "F" }
        ],
        section: 2
    },
    {
        id: 46,
        question: "你更倾向或喜欢：",
        options: [
            { text: "理想", score: "N" },
            { text: "现实", score: "S" }
        ],
        section: 2
    },
    {
        id: 47,
        question: "你更倾向或喜欢：",
        options: [
            { text: "雄心", score: "T" },
            { text: "柔肠", score: "F" }
        ],
        section: 2
    },
    {
        id: 48,
        question: "你更倾向或喜欢：",
        options: [
            { text: "想象中的", score: "N" },
            { text: "事实上的", score: "S" }
        ],
        section: 2
    },
    {
        id: 49,
        question: "你更倾向或喜欢：",
        options: [
            { text: "冷静的", score: "T" },
            { text: "激情的", score: "F" }
        ],
        section: 2
    },
    {
        id: 50,
        question: "你更倾向或喜欢：",
        options: [
            { text: "制作", score: "S" },
            { text: "创造", score: "N" }
        ],
        section: 2
    },
    {
        id: 51,
        question: "你更倾向或喜欢：",
        options: [
            { text: "热情的", score: "F" },
            { text: "中立的", score: "T" }
        ],
        section: 2
    },
    {
        id: 52,
        question: "你更倾向或喜欢：",
        options: [
            { text: "明理的", score: "S" },
            { text: "迷人的", score: "N" }
        ],
        section: 2
    },
    {
        id: 53,
        question: "你更倾向或喜欢：",
        options: [
            { text: "有同情心", score: "F" },
            { text: "有逻辑头脑", score: "T" }
        ],
        section: 2
    },
    {
        id: 54,
        question: "你更倾向或喜欢：",
        options: [
            { text: "生产", score: "S" },
            { text: "设计", score: "N" }
        ],
        section: 2
    },
    {
        id: 55,
        question: "你更倾向或喜欢：",
        options: [
            { text: "冲动", score: "P" },
            { text: "决择", score: "J" }
        ],
        section: 2
    },
    {
        id: 56,
        question: "你更倾向或喜欢：",
        options: [
            { text: "公正的", score: "T" },
            { text: "体谅的", score: "F" }
        ],
        section: 2
    },
    {
        id: 57,
        question: "你更倾向或喜欢：",
        options: [
            { text: "安静的", score: "I" },
            { text: "爱交际的", score: "E" }
        ],
        section: 2
    },
    {
        id: 58,
        question: "你更倾向或喜欢：",
        options: [
            { text: "理性", score: "T" },
            { text: "感性", score: "F" }
        ],
        section: 2
    },

    // 第三部分：59-78题
    {
        id: 59,
        question: "你更倾向或喜欢：",
        options: [
            { text: "不受限制的", score: "P" },
            { text: "安排好的", score: "J" }
        ],
        section: 3
    },
    {
        id: 60,
        question: "你更倾向或喜欢：",
        options: [
            { text: "具体", score: "S" },
            { text: "抽象", score: "N" }
        ],
        section: 3
    },
    {
        id: 61,
        question: "你更倾向或喜欢：",
        options: [
            { text: "能干的", score: "T" },
            { text: "细腻的", score: "F" }
        ],
        section: 3
    },
    {
        id: 62,
        question: "你更倾向或喜欢：",
        options: [
            { text: "开放", score: "E" },
            { text: "私密", score: "I" }
        ],
        section: 3
    },
    {
        id: 63,
        question: "你更倾向或喜欢：",
        options: [
            { text: "建造", score: "S" },
            { text: "发明", score: "N" }
        ],
        section: 3
    },
    {
        id: 64,
        question: "你更倾向或喜欢：",
        options: [
            { text: "有序的", score: "J" },
            { text: "随便的", score: "P" }
        ],
        section: 3
    },
    {
        id: 65,
        question: "你更倾向或喜欢：",
        options: [
            { text: "想象", score: "N" },
            { text: "现实", score: "S" }
        ],
        section: 3
    },
    {
        id: 66,
        question: "你更倾向或喜欢：",
        options: [
            { text: "好胜的", score: "T" },
            { text: "好心的", score: "F" }
        ],
        section: 3
    },
    {
        id: 67,
        question: "你更倾向或喜欢：",
        options: [
            { text: "理论", score: "N" },
            { text: "事实", score: "S" }
        ],
        section: 3
    },
    {
        id: 68,
        question: "你更倾向或喜欢：",
        options: [
            { text: "很少的朋友", score: "I" },
            { text: "很多的朋友", score: "E" }
        ],
        section: 3
    },
    {
        id: 69,
        question: "你更倾向或喜欢：",
        options: [
            { text: "可能", score: "N" },
            { text: "确知", score: "S" }
        ],
        section: 3
    },
    {
        id: 70,
        question: "你更倾向或喜欢：",
        options: [
            { text: "宽容的", score: "F" },
            { text: "坚决的", score: "T" }
        ],
        section: 3
    },
    {
        id: 71,
        question: "你更倾向或喜欢：",
        options: [
            { text: "新异的", score: "N" },
            { text: "已知的", score: "S" }
        ],
        section: 3
    },
    {
        id: 72,
        question: "你更倾向或喜欢：",
        options: [
            { text: "温柔", score: "F" },
            { text: "力量", score: "T" }
        ],
        section: 3
    },
    {
        id: 73,
        question: "你更倾向或喜欢：",
        options: [
            { text: "实用", score: "S" },
            { text: "创新", score: "N" }
        ],
        section: 3
    },
    {
        id: 74,
        question: "和一群人在一起聚会通常会让你感到：",
        options: [
            { text: "兴致勃勃", score: "E" },
            { text: "筋疲力尽", score: "I" }
        ],
        section: 3
    },
    {
        id: 75,
        question: "你在做一个决定时，更多地会：",
        options: [
            { text: "权衡实际的得失", score: "T" },
            { text: "考虑其他人的感受", score: "F" }
        ],
        section: 3
    },
    {
        id: 76,
        question: "通常你更喜欢：",
        options: [
            { text: "提前安排好该做什么", score: "J" },
            { text: "到时候率性而为", score: "P" }
        ],
        section: 3
    },
    {
        id: 77,
        question: "当你一个人在家时，你：",
        options: [
            { text: "能够沉浸在自己的思维中", score: "I" },
            { text: "总觉的应该做点什么事情", score: "E" }
        ],
        section: 3
    },
    {
        id: 78,
        question: "多数情况下，你：",
        options: [
            { text: "随兴致做事", score: "P" },
            { text: "按日程表做事", score: "J" }
        ],
        section: 3
    },

    // 第四部分：79-93题
    {
        id: 79,
        question: "你通常：",
        options: [
            { text: "容易和大家打成一片", score: "E" },
            { text: "独处的时候更多", score: "I" }
        ],
        section: 4
    },
    {
        id: 80,
        question: "你做事更倾向于：",
        options: [
            { text: "等到各方面的信息都全了以后再做计划", score: "P" },
            { text: "提前很久就定计划", score: "J" }
        ],
        section: 4
    },
    {
        id: 81,
        question: "别人____交上朋友：",
        options: [
            { text: "容易和你", score: "E" },
            { text: "较难和你", score: "I" }
        ],
        section: 4
    },
    {
        id: 82,
        question: "你通常喜欢上____的课程：",
        options: [
            { text: "探讨理论和概念", score: "N" },
            { text: "列举事实和图表", score: "S" }
        ],
        section: 4
    },
    {
        id: 83,
        question: "在聚会时，你：",
        options: [
            { text: "说的时候多", score: "E" },
            { text: "听的时候多", score: "I" }
        ],
        section: 4
    },
    {
        id: 84,
        question: "你觉的自己更倾向于是一个：",
        options: [
            { text: "随意的人", score: "P" },
            { text: "有秩序的人", score: "J" }
        ],
        section: 4
    },
    {
        id: 85,
        question: "你：",
        options: [
            { text: "只同那些兴趣相同的人才能长谈", score: "I" },
            { text: "只要愿意，和任何人都可以长聊", score: "E" }
        ],
        section: 4
    },
    {
        id: 86,
        question: "当你有一个报告需要在一个星期内交出时，你：",
        options: [
            { text: "常留出足够的时间并能提早完成", score: "J" },
            { text: "常常是在最后一刻及时赶出来", score: "P" }
        ],
        section: 4
    },
    {
        id: 87,
        question: "哪一个对你来说是更高的评价？",
        options: [
            { text: "有好胜心的", score: "T" },
            { text: "有同情心的", score: "F" }
        ],
        section: 4
    },
    {
        id: 88,
        question: "你觉得按日程表办事：",
        options: [
            { text: "虽有必要，但不喜欢", score: "P" },
            { text: "有帮助的，非常喜欢", score: "J" }
        ],
        section: 4
    },
    {
        id: 89,
        question: "你更愿在一个____的老板手下工作：",
        options: [
            { text: "态度亲切，但有时会感情用事", score: "F" },
            { text: "态度严厉，但始终按逻辑办事", score: "T" }
        ],
        section: 4
    },
    {
        id: 90,
        question: "在完成一项大任务时，你常常是：",
        options: [
            { text: "边做边考虑下一步", score: "P" },
            { text: "事先想好每个步骤", score: "J" }
        ],
        section: 4
    },
    {
        id: 91,
        question: "在社交场合，你通常觉得：",
        options: [
            { text: "很难和不认识的人进行交谈", score: "I" },
            { text: "很容易和多数人谈笑风生", score: "E" }
        ],
        section: 4
    },
    {
        id: 92,
        question: "你常常是：",
        options: [
            { text: "按已经有效的方法做事", score: "S" },
            { text: "尝试一下有没有更好的办法", score: "N" }
        ],
        section: 4
    },
    {
        id: 93,
        question: "你更喜欢按____做事情：",
        options: [
            { text: "当天的感觉", score: "P" },
            { text: "已订好的日程表", score: "J" }
        ],
        section: 4
    }

];

// 人格类型描述
export const personalityDescriptions = {
    "ISTJ": "检查员型人格 - 安静、严肃、可靠，通过周全和可靠取得成功",
    "ISFJ": "保护者型人格 - 安静、友好、负责，致力于完成自己的义务",
    "INFJ": "提倡者型人格 - 寻求意义和连接，有强烈的直觉和原则",
    "INTJ": "建筑师型人格 - 具有原创思想，有强大的动力实现自己的想法",
    "ISTP": "鉴赏家型人格 - 灵活、冷静的观察者，擅长找到实用的解决方案",
    "ISFP": "探险家型人格 - 安静、友好、敏感，享受当下和周围环境",
    "INFP": "调停者型人格 - 理想主义者，忠于自己的价值观和重要的人",
    "INTP": "逻辑学家型人格 - 对知识有止不住的渴望，喜欢理论抽象的概念",
    "ESTP": "企业家型人格 - 灵活、宽容，注重实际和即时行动",
    "ESFP": "表演者型人格 - 外向、友好，热爱生活、物质享受和人群",
    "ENFP": "竞选者型人格 - 热情、有创造力，能很快将事情和信息联系起来",
    "ENTP": "辩论家型人格 - 聪明、好奇，喜欢挑战他人和自己的思维",
    "ESTJ": "总经理型人格 - 实际、现实，是天生的商业或机械领导者",
    "ESFJ": "执政官型人格 - 热心、有责任心，喜欢与人和谐相处",
    "ENFJ": "主人公型人格 - 热情、有同情心，能很好地引导他人",
    "ENTJ": "指挥官型人格 - 坦诚、果断，是天生的领导者"
};

// 维度解释
export const dimensionExplanations = {
    "E": "外向 - 从与人交往中获取能量",
    "I": "内向 - 从独处和内部思考中获取能量",
    "S": "实感 - 关注具体事实和细节",
    "N": "直觉 - 关注整体模式和可能性",
    "T": "思维 - 基于逻辑和客观分析做决策",
    "F": "情感 - 基于价值观和他人感受做决策",
    "J": "判断 - 喜欢有计划、有条理的生活方式",
    "P": "感知 - 喜欢灵活、spontaneous 的生活方式"
};