import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Res,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MongooseClassSerializerInterceptor } from '@/shared/mongoose-class-serializer.interceptor';
import { AuthGuard } from '@nestjs/passport';
import { Permission } from '@/auth/enums/permission.enum';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import { UserAccount } from './schemas/useraccounts.schema';
import { UserAccountsService } from './useraccounts.service';
import { Response } from 'express';
import { ExportRequestOptions } from '@/shared/dto/export-request-options.dto';

@Controller('user_accounts')
@ApiTags('UserAccounts')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@UseInterceptors(MongooseClassSerializerInterceptor(UserAccount))
@UseGuards(PermissionsGuard)
@UseGuards(AuthGuard(['jwt', 'api-key']))
export class UserAccountsController {
  constructor(private readonly userAccountsService: UserAccountsService) {}

  @Get('export')
  @ApiOperation({
    summary: 'Exports UserAccounts document to json or csv.',
  })
  @ApiResponse({
    status: 200,
    description: 'UserAccounts export',
    type: [UserAccount],
  })
  @Permissions(Permission.UserAccountsExport)
  @ApiParam({ name: 'format', type: String })
  async export(
    @Query() options: ExportRequestOptions,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserAccount[] | undefined> {
    const userAccounts = await this.userAccountsService.export(options.format);

    if (options.format === 'json') return userAccounts as UserAccount[];

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="users.csv"',
    });
    res.send(userAccounts);
  }
}
