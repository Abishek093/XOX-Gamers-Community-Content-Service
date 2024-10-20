import { consumeQueue } from "./RabbitMQConsumer";
import { UserRepository } from "../repositories/UserRepository";
import { UserInteractor } from "../interactors/UserInteractor";


export const startQueueConsumer = () => {
  const userRepository = new UserRepository();
  const userInteractor = new UserInteractor(userRepository);

  consumeQueue('content-service-create-user', async (userData) => {
    try {
      console.log('userData', userData)
      await userInteractor.createUser(userData);
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  });

  consumeQueue('content-service-update-user', async (userData) => {
    try {
      console.log('userData', userData)
      await userInteractor.updateUser(userData);
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  });

  consumeQueue('content-service-update-profile-image', async (userData) => {
    try {
      console.log('userData', userData)
      await userInteractor.updateProfileImage(userData);
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  });
};

