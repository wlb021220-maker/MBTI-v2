const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    user_info: {
        name: {
            type: String,
            required: true
        },
        english_name: {
            type: String,
            default: ''
        },
        age: Number,
        gender: String,
        email: {
            type: String,
            required: false,
            default: ''
        },
        occupation: String,
        education: String,
        purpose: [String],
        region: String,
        organization: String,
        comments: String,
        employment: String
    },
    candidate_type: {
        type: String,
        enum: ['interview', 'employee', 'former'],
        default: 'interview'
    },
    test_results: {
        mbti_type: {
            type: String,
            required: true
        },
        dimension_scores: [{
            dimension: String,
            score: Number,
            percentage: Number
        }],
        answers: [{
            question_id: Number,
            question: String,
            selected_option: String,
            score: String
        }],
        test_duration: Number,
        test_id: String
    },
    metadata: {
        test_version: String,
        platform: String,
        user_agent: String,
        screen_resolution: String,
        ip_address: String,
        submission_time: Date
    },
    status: {
        type: String,
        enum: ['pending', 'processed', 'rejected', 'archived'],
        default: 'pending'
    },
    // 审核相关字段
    review_notes: {
        type: String,
        default: ''
    },
    reviewed_by: {
        type: String
    },
    reviewed_at: {
        type: Date
    },
    
    submission_time: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Result', resultSchema);