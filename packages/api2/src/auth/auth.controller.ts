import {
  Controller,
  Post,
  Body,
  InternalServerErrorException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EthSignatureService } from './eth-signature.service';
import { NonceResponseDto } from './dto/nonce-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { NonceInputDto } from './dto/nonce-input.dto';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from './interfaces/request-with-user.interface';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginInputDto } from './dto/login-input.dto';
import { EventLogService } from '@/event-log/event-log.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly ethSignatureService: EthSignatureService,
    private readonly eventLogService: EventLogService,
  ) {}

  @Post('eth-signature/nonce')
  @ApiOperation({
    summary: 'Generates a nonce for the user and returns it',
  })
  @ApiBody({
    type: NonceInputDto,
    description: 'A request containing the user identityEthAddress',
  })
  @ApiResponse({
    status: 201,
    description: 'Nonce generated successfully',
    type: NonceResponseDto,
  })
  async nonce(
    @Body() nonceRquestDto: NonceInputDto,
  ): Promise<NonceResponseDto> {
    const { identityEthAddress } = nonceRquestDto;
    const user = await this.ethSignatureService.generateUserNonce(
      identityEthAddress,
    );
    if (user && user.nonce) {
      return {
        identityEthAddress,
        nonce: user.nonce,
      };
    }
    throw new InternalServerErrorException('Failed to generate nonce.');
  }

  @UseGuards(AuthGuard('eth-signature'))
  @Post('eth-signature/login')
  @ApiOperation({
    summary: "Verifies a user's signature and returns a JWT token",
  })
  @ApiBody({
    type: LoginInputDto,
    description:
      'A request containing the user identityEthAddress and signed' +
      'login message. The signed message should be structured as follows: \n\n' +
      '```SIGN THIS MESSAGE TO LOGIN TO PRAISE.\\n\\nADDRESS:\\n[identityEthAddress]\\n\\n' +
      'NONCE:\\n[nonce]```',
  })
  @ApiResponse({
    status: 201,
    description: 'User authenticated successfully',
    type: LoginResponseDto,
  })
  async login(@Request() req: RequestWithUser): Promise<LoginResponseDto> {
    return this.ethSignatureService.login(req.user._id);
  }
}
