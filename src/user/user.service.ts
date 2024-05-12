import {
  DeleteItemCommand,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { v4 as uuid } from 'uuid';
import { dynamoDbClient } from 'src/database/dynamo-db-client';

const TABLE_NAME = 'user';

@Injectable()
export class UserService {
  async createUser(createUserDto: CreateUserDto) {
    const command = new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        userId: { S: uuid() },
        name: { S: createUserDto.name },
        email: { S: createUserDto.email },
        password: { S: createUserDto.password },
      },
    });

    const response = await dynamoDbClient.send(command);
    console.log(response);
    return response;
  }

  async getAllUser() {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });
    const response = await dynamoDbClient.send(command);
    console.log(response.Items, 'response.Items');
    return response;
  }

  async findSingleUser(userId: string) {
    const command = new GetItemCommand({
      TableName: TABLE_NAME,
      Key: {
        userId: { S: userId.toString() },
      },
    });

    const response = await dynamoDbClient.send(command);
    console.log(response);
    return response;
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const command = new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: {
        userId: { S: userId },
      },
      UpdateExpression: 'set #name = :name, email = :email',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':name': { S: updateUserDto.name },
        ':email': { S: updateUserDto.email },
      },
      ReturnValues: 'ALL_NEW',
    });

    const response = await dynamoDbClient.send(command);
    console.log(response);
    return response;
  }

  async deleteUser(userId: string) {
    const command = new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: {
        userId: { S: userId },
      },
    });

    const response = await dynamoDbClient.send(command);
    console.log(response);
    return response;
  }
}
