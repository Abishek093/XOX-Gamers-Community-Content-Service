import { IMessageBroker } from "../interfaces/IMessageBroker";
import CircuitBreaker from "opossum";
import { publishToQueue } from "../services/RabbitMQPublisher";

const circuitBreakerOptions = {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
};

export class MessageBroker implements IMessageBroker {
  private circuitBreaker;

  constructor() {
    this.circuitBreaker = new CircuitBreaker(async (message: any, queueName: string) => {
      await publishToQueue(queueName, message);
    }, circuitBreakerOptions);

    this.circuitBreaker.fallback((message: any, queueName: string) => {
      console.error(`Fallback triggered for queue ${queueName}. Message:`, message);
    });
  }

  async publishUserCreationMessage(userId: string, userName: string, displayName: string, profileImage: string): Promise<void> {
    const message = {
      userId,
      userName,
      displayName,
      profileImage
    };

    await this.circuitBreaker.fire(message, 'chat-service-create-user');
  }
}
