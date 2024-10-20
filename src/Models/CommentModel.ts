import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
    postId: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
}

const CommentSchema: Schema = new Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const CommentModel = mongoose.model<IComment>('Comment', CommentSchema);

export default CommentModel;
