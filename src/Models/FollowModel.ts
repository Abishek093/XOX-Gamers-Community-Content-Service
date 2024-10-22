// import mongoose, { Document, Schema } from 'mongoose';

// export interface IFollower extends Document {
//     userId: mongoose.Types.ObjectId;
//     followerId: mongoose.Types.ObjectId;
//     createdAt: Date;
// }

// const FollowerSchema: Schema = new Schema({
//     userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
//     followerId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
//     createdAt: { type: Date, default: Date.now }
// });

// export const Follower = mongoose.model<IFollower>('Follower', FollowerSchema);
import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './UserModel';

export interface IFollower extends Document {
    userId: mongoose.Types.ObjectId;
    followerId: mongoose.Types.ObjectId;
    status: 'Requested' | 'Accepted' | 'Rejected';
    createdAt: Date;
}

const FollowerSchema: Schema = new Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: 'Users' },
    followerId: { type: mongoose.Types.ObjectId, required: true, ref: 'Users' },
    status: { 
        type: String, 
        enum: ['Requested', 'Accepted', 'Rejected'], 
        default: 'Requested' 
    },
    createdAt: { type: Date, default: Date.now }
});

export interface IFollowerWithDetails extends IFollower {
    userDetails: Pick<IUser, 'username' | 'displayName' | 'profileImage'> | null;
}



export const Follower = mongoose.model<IFollower>('Follower', FollowerSchema);
