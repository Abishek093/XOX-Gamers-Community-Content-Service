import { consumeQueue } from "./RabbitMQConsumer";
import { UserRepository } from "../repositories/UserRepository";
import { UserInteractor } from "../interactors/UserInteractor";
import CustomError from "../utils/CustomError";
import { SponsoredPostRepository } from "../repositories/SponsoredPostRepository";
import { PostRepository } from "../repositories/PostRepository";
import { publishToQueue } from "./RabbitMQPublisher";
import { ContentConnectionRepository } from "../repositories/ContentConnectionRepository";
import { CommunityRepository } from "../repositories/CommunityRepository";


export const startQueueConsumer = () => {
  const userRepository = new UserRepository();
  const userInteractor = new UserInteractor(userRepository);
  const sponsoredPostRepository = new SponsoredPostRepository()
  const contentConnectionRepository = new ContentConnectionRepository()
  const communityRepository = new CommunityRepository();

  const postRepository = new PostRepository()
  
  consumeQueue('content-service-create-user', async (userData) => {
    try {
      console.log('userData', userData)
      await userInteractor.createUser(userData);
    } catch (error) {
      console.error("Failed to create user:", error);
      throw new CustomError("Failed to create user: " + (error instanceof Error || error instanceof CustomError ? error.message : "Unknown error"), 500);
    }
  });

  consumeQueue('content-service-update-user', async (userData) => {
    try {
      console.log('userData', userData)
      await userInteractor.updateUser(userData);
    } catch (error) {
      console.error("Failed to update user:", error);
      throw new CustomError("Failed to update user: " + (error instanceof Error || error instanceof CustomError ? error.message : "Unknown error"), 500);
    }
  });

  consumeQueue('content-service-update-profile-image', async (userData) => {
    try {
      console.log('userData', userData)
      await userInteractor.updateProfileImage(userData);
    } catch (error) {
      console.error("Failed to update profile image user:", error);
      throw new CustomError("Failed to update profile image user: " + (error instanceof Error || error instanceof CustomError ? error.message : "Unknown error"), 500);
    }
  });

  consumeQueue('content-service-update-profile-image', async (userData) => {
    try {
      console.log('userData', userData)
      await userInteractor.updateProfileImage(userData);
    } catch (error) {
      console.error("Failed to update profile image user:", error);
      throw new CustomError("Failed to update profile image user: " + (error instanceof Error || error instanceof CustomError ? error.message : "Unknown error"), 500);
    }
  });

  consumeQueue('content-service-block-user', async (userData) => {
    try {
      console.log('userData', userData)
      // await userInteractor.updateProfileImage(userData);
    } catch (error) {
      console.error("Failed to update profile image user:", error);
      throw new CustomError("Failed to update profile image user: " + (error instanceof Error || error instanceof CustomError ? error.message : "Unknown error"), 500);
    }
  });

  consumeQueue('content-service-sponsored-post', async (postData) => {
    try {
      await sponsoredPostRepository.createSponsoredPost(postData._id, postData.title, postData.imageUrl, postData.link)
    } catch (error) {
      console.error("Failed to add sponsored post:", error);
      throw new CustomError("Failed to add sponsored post: " + (error instanceof Error || error instanceof CustomError ? error.message : "Unknown error"), 500);
    }
  })

  consumeQueue('content_like_events', async (message: any) => {
    try {
      if (message.type === 'post_like_action') {
        const { postId, userId, action } = message.data;
        const postRepository = new PostRepository();

        if (action === 'like') {
          await postRepository.likePost(userId, postId);
        } else {
          await postRepository.unlikePost(userId, postId);
        }

        const post = await postRepository.fetchPostDetails(postId);
        const isLiked = action === 'like';

        await publishToQueue('content_like_updates', {
          postId,
          userId,
          likeCount: post?.likeCount || 0,
          liked: isLiked
        });
      }
    } catch (error) {
      console.error("Failed to process like action:", error);
    }
  });


  consumeQueue('content-service-follow', async (message: any) => {
    try {
      const { type, data } = message;

      switch (type) {
        case 'follow_request':
          await contentConnectionRepository.createFollowRequest(
            data.followerId,
            data.userId
          );
          break;

        case 'follow_accept':
          await contentConnectionRepository.updateFollowStatus(
            data.userId,
            data.followerId,
            'Accepted'
          );
          break;

        case 'follow_reject':
          await contentConnectionRepository.updateFollowStatus(
            data.userId,
            data.followerId,
            'Rejected'
          );
          break;

        case 'unfollow':
          await contentConnectionRepository.removeFollowRelation(
            data.userId,
            data.followerId
          );
          break;
      }
    } catch (error) {
      console.error("Failed to process follow action:", error);
    }
  });


  consumeQueue('community_follow_events', async (message: any) => {
    try {
      
      if (message.type === 'community_follow_action') {
        const { communityId, userId, action } = message.data;
        
        if (action === 'follow') {
          await communityRepository.followCommunity(userId, communityId);
        } else {
          await communityRepository.unfollowCommunity(userId, communityId);
        }
  
        const followers = await communityRepository.fetchCommunityFollowers(communityId);
        
        await publishToQueue('community_follow_updates', {
          communityId,
          followerCount: followers.length,
          followers: followers.map(f => f.userId)
        });
      }
    } catch (error) {
      console.error("Failed to process community follow action:", error);
    }
  });


  consumeQueue('admin-service-delete-reported-post', async (postData) => {
    try {
      await postRepository.deletePost(postData.postId)
    } catch (error) {
      console.error("Failed to delete reported post:", error);
      throw new CustomError("Failed to delete reported post: " + (error instanceof Error || error instanceof CustomError ? error.message : "Unknown error"), 500);
    }
  })

  consumeQueue('admin-service-resolve-report', async (postData) => {
    try {
      await postRepository.resolveReport(postData.postId)
    } catch (error) {
      console.error("Failed to resolve reported post:", error);
      throw new CustomError("Failed to resolve reported post: " + (error instanceof Error || error instanceof CustomError ? error.message : "Unknown error"), 500);
    }
  })
};