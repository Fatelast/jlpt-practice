import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { WechatLoginDto } from './dto/wechat-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('wechat-login')
  wechatLogin(@Body() body: WechatLoginDto) {
    return this.authService.wechatLogin(body);
  }

  @Post('admin-login')
  adminLogin(@Body() body: AdminLoginDto) {
    return this.authService.adminLogin(body);
  }
}
