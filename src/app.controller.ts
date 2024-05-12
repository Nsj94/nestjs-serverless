import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // hit this endpoint to create  the user table in dynamodb
  @Get('/user-table')
  async getHello() {
    return await this.appService.getHello();
  }
}
