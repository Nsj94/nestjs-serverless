import { HttpException, HttpStatus } from '@nestjs/common';

export const createCustomError = (message: string, status: HttpStatus) => {
  throw new HttpException(message, status);
};

export const transformedResponseForGetAll = (response: any) => {
  const transformedItems = response.Items.map((item: any) => {
    const transformedItem: any = {};
    for (const key in item) {
      transformedItem[key] = item[key].S;
    }
    return transformedItem;
  });

  const transformedResponse = {
    Items: transformedItems,
    Count: response.Count,
    ScannedCount: response.ScannedCount,
  };

  return transformedResponse;
};

export const extractDataById = (response: any) => {
  const attributes = response;
  const userData = {} as any;
  // Convert DynamoDB attribute format to plain object with string values
  for (const key in attributes) {
    userData[key] = attributes[key].S;
  }
  return userData;
};
