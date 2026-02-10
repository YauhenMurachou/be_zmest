import { Request, Response } from 'express';

export const getCaptchaUrl = (
  _request: Request,
  response: Response,
): void => {
  // Stub implementation that returns a placeholder captcha image URL.
  // Frontend expects an object: { url: string }
  response.status(200).json({
    url: 'https://social-network.samuraijs.com/activecontent/images/captcha.jpg',
  });
};

