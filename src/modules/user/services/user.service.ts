import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  DeleteItemCommand,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { v4 as uuid } from 'uuid';

import { dynamoDbClient } from 'src/database/dynamo-db-client';
import {
  createCustomError,
  extractDataById,
  transformedResponseForGetAll,
} from 'src/common/utils';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

const TABLE_NAME = 'user';

@Injectable()
export class UserService {
  private readonly logger = new Logger('UserService');

  async createUser(createUserDto: CreateUserDto) {
    this.logger.log(JSON.stringify(createUserDto), 'create user payload');
    const command = new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        userId: { S: uuid() },
        name: { S: createUserDto.name },
        email: { S: createUserDto.email },
        password: { S: createUserDto.password },
      },
    });

    try {
      const response = await dynamoDbClient.send(command);
      this.logger.log('User created successfully');
      this.logger.debug(`Created User: ${JSON.stringify(response)}`);
      return 'User Created successfully';
    } catch (e) {
      throw createCustomError(
        e.message || 'Something went wrong',
        e.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAllUser() {
    this.logger.log('Get All Users');
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });
    try {
      const response = await dynamoDbClient.send(command);
      this.logger.debug(`Get All users: ${JSON.stringify(response)}`);
      const userData = transformedResponseForGetAll(response);
      return userData.Items;
    } catch (e) {
      this.logger.error('Error getting all users', e);
      throw createCustomError(
        e.message || 'Something went wrong',
        e.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findSingleUser(userId: string) {
    this.logger.log('Get UserById');
    const command = new GetItemCommand({
      TableName: TABLE_NAME,
      Key: {
        userId: { S: userId.toString() },
      },
    });

    try {
      const response = await dynamoDbClient.send(command);
      this.logger.debug(`Get userById: ${JSON.stringify(response)}`);
      if (!response.Item) {
        console.log('check in user by id ');
        throw createCustomError('User not found', HttpStatus.NOT_FOUND);
      }
      const userData = await extractDataById(response.Item);
      console.log(userData, 'userData');
      return userData;
    } catch (e) {
      this.logger.error(`Error getting user by ID: ${userId}`, e);
      throw createCustomError(
        e.message || 'Something went wrong',
        e.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    this.logger.log(JSON.stringify(updateUserDto), 'Update UserById');
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
    const getUserCommand = new GetItemCommand({
      TableName: TABLE_NAME,
      Key: {
        userId: { S: userId.toString() },
      },
    });
    try {
      const getExistingUser = await dynamoDbClient.send(getUserCommand);
      if (!getExistingUser.Item) {
        throw createCustomError('User does not exist.', HttpStatus.CONFLICT);
      }
      const response = await dynamoDbClient.send(command);
      this.logger.debug(`Updated userById: ${JSON.stringify(response)}`);
      const userData = extractDataById(response.Attributes);
      return userData;
    } catch (e) {
      this.logger.error(`Error updating user by ID: ${userId}`, e);
      throw createCustomError(
        e.message || 'Something went wrong',
        e.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteUser(userId: string) {
    this.logger.log(JSON.stringify(userId), 'Delete UserById');
    const command = new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: {
        userId: { S: userId },
      },
    });

    const getUserCommand = new GetItemCommand({
      TableName: TABLE_NAME,
      Key: {
        userId: { S: userId.toString() },
      },
    });

    try {
      const getExistingUser = await dynamoDbClient.send(getUserCommand);
      this.logger.debug(`Get userById: ${JSON.stringify(getExistingUser)}`);
      if (!getExistingUser.Item) {
        throw createCustomError('User not found', HttpStatus.NOT_FOUND);
      }
      const response = await dynamoDbClient.send(command);
      this.logger.debug(`Deleted userById: ${JSON.stringify(response)}`);
      return 'User Deleted Successfully';
    } catch (e) {
      this.logger.error(`Error deleting user by ID: ${userId}`, e);
      throw createCustomError(
        e.message || 'Something went wrong',
        e.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
