import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunity extends Document {
    name: string;
    description?: string;
    createdBy: mongoose.Types.ObjectId;
    followers: mongoose.Types.ObjectId[];
    posts: mongoose.Types.ObjectId[];
    postPermission: 'admin' | 'anyone';
    image?: string;  
    createdAt: Date;
    updatedAt: Date;
}

const CommunitySchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], 
    postPermission: {
        type: String,
        enum: ['admin', 'anyone'],
        default: 'admin',
        required: true,
    },
    image: { type: String }, 
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});


export interface ICommunityWithCounts extends ICommunity {
    postCount: number;
    followerCount: number;
  }


export const Community = mongoose.model<ICommunity>('Community', CommunitySchema);
