import amqp from 'amqplib/callback_api';
const rabbitmqUrl = `amqp://${process.env.RABBITMQ_HOST || 'localhost'}`;
import { PostRepository } from '../repositories/PostRepository';

export const consumeQueue = (queueName: string, callback: (message: any) => void): void => {
  // console.log(`Attempting to connect to RabbitMQ and consume from queue: ${queueName}`);

  amqp.connect(rabbitmqUrl, (connectError, connection) => {
    if (connectError) {
      console.error('Failed to connect to RabbitMQ:', connectError);
      return;
    }

    console.log('Successfully connected to RabbitMQ');

    connection.createChannel((channelError, channel) => {
      if (channelError) {
        console.error('Failed to create channel:', channelError);
        return;
      }

      // console.log('Successfully created channel');

      channel.assertQueue(queueName, { durable: true }, (assertError, assertOk) => {
        if (assertError) {
          console.error('Failed to assert queue:', assertError);
          return;
        }

        // console.log(`Queue ${queueName} asserted successfully`);

        channel.consume(queueName, (msg) => {
          if (msg !== null) {
            console.log(`Received message from queue ${queueName}`);
            const messageContent = JSON.parse(msg.content.toString());
            console.log('Message content:', messageContent);
            callback(messageContent);
            channel.ack(msg);
          }
        }, { noAck: false });
      });

      channel.on('error', (err) => {
        console.error('Channel error:', err);
      });

      channel.on('close', () => {
        console.log('Channel closed');
      });
    });

    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
    });

    connection.on('close', () => {
      console.log('RabbitMQ connection closed');
    });
  });
};