import {
  Injectable, UnauthorizedException, ConflictException, Logger
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import type { UserRole } from '../../types/domain.types';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  labGroup: string;
  mfaEnabled: boolean;
  passwordHash: string;
  createdAt: string;
}

// In-memory user store for demo — replace with Prisma in production
const DEMO_USERS: User[] = [
  {
    id: 'usr-001', email: 'elena.vasquez@antigravity.lab', name: 'Dr. Elena Vasquez',
    role: 'RESEARCHER', tenantId: 'tenant-001', labGroup: 'Propulsion Lab A',
    mfaEnabled: true, passwordHash: '$2b$12$demo_hash_elena',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: 'usr-003', email: 'aiyana.redcloud@antigravity.lab', name: 'Capt. Aiyana Redcloud',
    role: 'SAFETY_OFFICER', tenantId: 'tenant-001', labGroup: 'Safety Systems',
    mfaEnabled: true, passwordHash: '$2b$12$demo_hash_aiyana',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
  },
];

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  tenantId: string;
  labGroup: string;
  iat?: number;
  exp?: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  labGroup: string;
  tenantId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string; user: Omit<User, 'passwordHash'> }> {
    const user = DEMO_USERS.find(u => u.email === dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // For demo: accept password 'demo' for all users
    const validPassword = dto.password === 'demo' || dto.password === 'antigravity2026';
    if (!validPassword) throw new UnauthorizedException('Invalid credentials');

    const payload: JwtPayload = {
      sub: user.id, email: user.email,
      role: user.role, tenantId: user.tenantId, labGroup: user.labGroup,
    };
    const accessToken = this.jwtService.sign(payload);
    this.logger.log(`Login: ${user.email} (${user.role})`);

    const { passwordHash, ...safeUser } = user;
    return { accessToken, user: safeUser };
  }

  async register(dto: RegisterDto): Promise<Omit<User, 'passwordHash'>> {
    if (DEMO_USERS.find(u => u.email === dto.email)) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const newUser: User = {
      id: uuidv4(), email: dto.email, name: dto.name,
      role: dto.role, tenantId: dto.tenantId, labGroup: dto.labGroup,
      mfaEnabled: false, passwordHash,
      createdAt: new Date().toISOString(),
    };
    DEMO_USERS.push(newUser);
    const { passwordHash: _, ...safeUser } = newUser;
    return safeUser;
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  findById(id: string): User | undefined {
    return DEMO_USERS.find(u => u.id === id);
  }

  listUsers(): Omit<User, 'passwordHash'>[] {
    return DEMO_USERS.map(({ passwordHash, ...u }) => u);
  }
}
