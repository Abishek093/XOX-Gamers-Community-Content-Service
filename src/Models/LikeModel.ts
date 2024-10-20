
import mongoose, { Schema, Document } from 'mongoose';

export interface ILike extends Document {
    postId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const LikeSchema: Schema = new Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const LikeModel = mongoose.model<ILike>('Like', LikeSchema);

export default LikeModel;
