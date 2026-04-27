import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Tenant middleware — reads X-Tenant-ID header and attaches it to the request.
 * In production: validates tenant against database, caches in Redis.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request & { tenantId?: string }, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (tenantId) {
      req.tenantId = tenantId;
    }
    next();
  }
}
