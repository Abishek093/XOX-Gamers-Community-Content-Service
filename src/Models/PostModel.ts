import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPost extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  likeCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

class PostEntity {
  title!: string;
  content!: string;
  author!: mongoose.Types.ObjectId;
  likeCount?: number;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(title: string, content: string, author: mongoose.Types.ObjectId) {
    this.title = title;
    this.content = content;
    this.author = author;
  }
}

export const PostSchema: Schema<IPost> = new Schema({
  title: { type: String, required: false },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true  
});

PostSchema.virtual('likeCount', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'postId',
  count: true
});

PostSchema.set('toObject', { virtuals: true });
PostSchema.set('toJSON', { virtuals: true });

PostSchema.loadClass(PostEntity);

const PostModel: Model<IPost> = mongoose.model<IPost>('Post', PostSchema);

export default PostModel;
