import { CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { Injectable } from '@nestjs/common';
import { dynamoDbClient } from './database/dynamo-db-client';

@Injectable()
export class AppService {
  async getHello() {
    const command = new CreateTableCommand({
      TableName: 'user',
      KeySchema: [
        {
          AttributeName: 'userId',
          KeyType: 'HASH',
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: 'userId',
          AttributeType: 'S',
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    });

    const response = await dynamoDbClient.send(command);
    console.log(response);
    return 'Table created';
  }
}
