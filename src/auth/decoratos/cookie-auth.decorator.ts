import { SetMetadata } from '@nestjs/common';

export const IS_COOKIE_AUTH_BASED = 'isCookieAuthBased';
export const CookieAuth = () => SetMetadata(IS_COOKIE_AUTH_BASED, true);
