import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface for the SponsoredPost document with readonly properties
export interface ISponsoredPost extends Document {
  readonly title: string;
  readonly imageUrl: string;
  readonly link: string;  // Readonly field
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// Mongoose schema definition
const SponsoredPostSchema: Schema = new Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  link: { type: String, required: true },  // New field
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


SponsoredPostSchema.statics.fetchSponsoredPosts = async function (): Promise<ISponsoredPost[]> {
  return this.find().select('-__v').lean(); 
};

const SponsoredPostModel: Model<ISponsoredPost> = mongoose.model<ISponsoredPost>('SponsoredPost', SponsoredPostSchema);

export default SponsoredPostModel;
