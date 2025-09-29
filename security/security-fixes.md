# CrecheManagement Security Fixes Guide

> **Status:** DRAFT - Awaiting Implementation  
> **Priority:** CRITICAL - Immediate Action Required  
> **Last Updated:** $(date '+%Y-%m-%d')

---

## 🚨 CRITICAL FIXES (Implement Immediately)

### 1. Fix Hardcoded Database Credentials

**Files to Fix:** `backend/src/app.module.ts`, `docker-compose.yml`

**Current Issue:**
```typescript
// ❌ CURRENT - CRITICAL VULNERABILITY
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'app_user',      // HARDCODED!
  password: 'app_pass',      // HARDCODED!
  database: 'app_db',       // HARDCODED!
  // ...
})
```

**✅ FIX:**
```typescript
// backend/src/app.module.ts
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Creche, Child],
  synchronize: process.env.NODE_ENV !== 'production', // Never sync in production
})
```

**Create Environment Files:**
```bash
# backend/.env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=app_user
DB_PASSWORD=your_secure_random_password_here
DB_NAME=app_db
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
API_BASE_URL=https://localhost:3000

# backend/.env.production (for production)
DB_HOST=your_production_host
DB_PORT=5432
DB_USERNAME=prod_user
DB_PASSWORD=super_secure_production_password
DB_NAME=prod_db
NODE_ENV=production
JWT_SECRET=production_jwt_secret_key_minimum_32_chars
API_BASE_URL=https://your-domain.com
```

### 2. Update All .gitignore Files

**Files to Fix:** `.gitignore` (root), `backend/.gitignore`, `front/.gitignore`

**✅ ADD TO ROOT .gitignore:**
```gitignore
# Node modules
node_modules/

# Environment files - CRITICAL SECURITY
.env
.env.*
.env.local
.env.production
.env.staging
.env.development

# Security sensitive files
*.pem
*.key
*.crt
config/secrets.yml
secrets/

# IDE and editor settings
.vscode/
.idea/

# Package lock files
package-lock.json
yarn.lock

# TypeScript cache
*.tsbuildinfo

# Logs
logs/
*.log
```

**✅ UPDATE backend/.gitignore (ADD):**
```gitignore
# Environment variables
.env
.env.*

# Database
*.sqlite
*.db

# Production builds
dist/
build/
```

**✅ UPDATE front/.gitignore (ADD):**
```gitignore
# Environment variables
.env
.env.*

# Build outputs
dist/
build/
```

### 3. Fix HTTP URLs - Use HTTPS Everywhere

**Files to Fix:** 
- `front/src/services/api.js`
- `front/src/store/index.js` 
- `backend/src/main.ts`

**✅ FIX - front/src/services/api.js:**
```javascript
// ❌ CURRENT
const api = axios.create({
  baseURL: 'http://localhost:3000'  // HTTP is insecure!
})

// ✅ FIX
const api = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || 'https://localhost:3000'
})
```

**✅ FIX - front/src/store/index.js:**
```javascript
// Replace ALL hardcoded URLs:
// ❌ OLD: 'http://localhost:3000/user'
// ✅ NEW: `${process.env.VUE_APP_API_BASE_URL}/user`

// Add at top of file:
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://localhost:3000'

// Then update all axios calls:
const response = await axios.get(`${API_BASE_URL}/user`, {
const response = await axios.put(`${API_BASE_URL}/user`, { username, email });
const response = await axios.get(`${API_BASE_URL}/child-care`)
```

**✅ CREATE - front/.env:**
```env
VUE_APP_API_BASE_URL=https://localhost:3000
```

### 4. Implement Proper Authentication System

**Files to Fix:** All controllers using `@Headers('X-Auth')`

**✅ INSTALL DEPENDENCIES:**
```bash
cd backend
npm install @nestjs/jwt @nestjs/passport passport-jwt bcrypt
npm install --save-dev @types/bcrypt @types/passport-jwt
```

**✅ CREATE - backend/src/auth/auth.module.ts:**
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

**✅ CREATE - backend/src/auth/jwt.strategy.ts:**
```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
```

**✅ CREATE - backend/src/auth/auth.guard.ts:**
```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**✅ UPDATE Controllers - Replace X-Auth with JWT:**
```typescript
// ❌ OLD WAY
@Post()
async create(
  @Body('name') name: string,
  @Headers('X-Auth') username: string,
): Promise<Creche> {
  if (!username) {
    throw new UnauthorizedException('X-Auth header is required');
  }
  // ...
}

// ✅ NEW WAY
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';

@UseGuards(JwtAuthGuard)
@Post()
async create(
  @Body('name') name: string,
  @Request() req,
): Promise<Creche> {
  const username = req.user.username;
  // ...
}
```

### 5. Add Input Validation

**Files to Fix:** All controllers and DTOs

**✅ UPDATE - backend/src/main.ts:**
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add global validation pipe - SECURITY CRITICAL
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // Remove unknown properties
    forbidNonWhitelisted: true, // Throw error if unknown properties
    transform: true,           // Transform payloads to DTO instances
    disableErrorMessages: process.env.NODE_ENV === 'production', // Hide errors in production
  }));

  // Secure CORS configuration
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://localhost:8081'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
```

**✅ UPDATE - backend/user/user.controller.ts:**
```typescript
import { IsEmail, IsString, Length } from 'class-validator';

// Create DTO classes
class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(3, 50)
  username: string;
}

class GetUserDto {
  @IsString()
  @Length(3, 50)
  username: string;
}

@Controller('user')
export class UserController {
  @Get()
  async getUser(@Query() query: GetUserDto): Promise<User> {
    const user = await this.userService.findByUsername(query.username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Put()
  async createOrUpdateUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createOrUpdate(createUserDto.email, createUserDto.username);
  }
}
```

---

## 🔒 HIGH PRIORITY FIXES (Implement This Week)

### 6. Add Security Headers

**✅ INSTALL:**
```bash
cd backend
npm install helmet
```

**✅ UPDATE - backend/src/main.ts:**
```typescript
import * as helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Add security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
  }));
  
  // ... rest of configuration
}
```

### 7. Implement Rate Limiting

**✅ INSTALL:**
```bash
npm install @nestjs/throttler
```

**✅ UPDATE - backend/src/app.module.ts:**
```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,      // Time window in seconds
      limit: 100,   // Max requests per window
    }),
    // ... other imports
  ],
})
```

### 8. Improve Error Handling

**✅ CREATE - backend/src/filters/all-exceptions.filter.ts:**
```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      message = typeof errorResponse === 'string' 
        ? errorResponse 
        : (errorResponse as any).message || message;
    }

    // Log the full error internally
    this.logger.error(`HTTP ${status} Error: ${message}`, exception);

    // Return sanitized error to client
    response.status(status).json({
      statusCode: status,
      message: process.env.NODE_ENV === 'production' 
        ? 'An error occurred' 
        : message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

**✅ UPDATE - backend/src/main.ts:**
```typescript
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

app.useGlobalFilters(new AllExceptionsFilter());
```

---

## ⚠️ MEDIUM PRIORITY FIXES (Next Sprint)

### 9. Add Comprehensive Logging

**✅ INSTALL:**
```bash
npm install winston nest-winston
```

**✅ CREATE - backend/src/config/logger.config.ts:**
```typescript
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const loggerConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context }) => {
          return `${timestamp} [${context}] ${level}: ${message}`;
        }),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});
```

### 10. Database Security Enhancements

**✅ UPDATE - backend/src/app.module.ts:**
```typescript
TypeOrmModule.forRoot({
  // ... existing config
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  extra: {
    connectionLimit: 10,
    acquireConnectionTimeout: 60000,
    timeout: 60000,
    reconnect: true,
  },
  logging: process.env.NODE_ENV === 'development',
  synchronize: false, // NEVER true in production
  migrationsRun: true,
})
```

### 11. Frontend Security Improvements

**✅ UPDATE - front/src/main.js:**
```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Add CSP meta tag programmatically
const cspMeta = document.createElement('meta')
cspMeta.httpEquiv = 'Content-Security-Policy'
cspMeta.content = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
document.head.appendChild(cspMeta)

const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')
```

**✅ UPDATE - front/src/services/api.js:**
```javascript
import axios from 'axios'
import store from '../store'

const api = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || 'https://localhost:3000',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = store.state.auth.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      store.dispatch('auth/logout')
    }
    return Promise.reject(error)
  }
)

export default api
```

---

## 📋 Implementation Checklist

### Phase 1: Critical (Day 1-2)
- [ ] Create `.env` files with secure random passwords
- [ ] Update all `.gitignore` files
- [ ] Fix hardcoded database credentials in `app.module.ts`
- [ ] Replace HTTP URLs with HTTPS/environment variables
- [ ] Test that application still works with environment variables

### Phase 2: High Priority (Day 3-5)
- [ ] Install and configure JWT authentication
- [ ] Replace X-Auth headers with JWT tokens
- [ ] Add input validation to all controllers
- [ ] Install and configure Helmet for security headers
- [ ] Add rate limiting with Throttler
- [ ] Implement proper error handling

### Phase 3: Medium Priority (Week 2)
- [ ] Add comprehensive logging with Winston
- [ ] Configure database security settings
- [ ] Update frontend security configuration
- [ ] Add API request/response interceptors
- [ ] Implement frontend token management

### Phase 4: Testing & Monitoring (Week 3)
- [ ] Test all security fixes
- [ ] Perform security scan
- [ ] Set up monitoring and alerting
- [ ] Document security procedures
- [ ] Train team on secure practices

---

## 🧪 Testing Security Fixes

### After Each Phase:
```bash
# Test environment variable loading
node -e "console.log(process.env.DB_USERNAME)"

# Test API endpoints still work
curl -X GET https://localhost:3000/user?username=test

# Test authentication
curl -X POST https://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"password"}'

# Test CORS configuration
curl -X OPTIONS https://localhost:3000/user \
  -H "Origin: https://localhost:8081" \
  -H "Access-Control-Request-Method: GET"
```

---

## 🚨 IMPORTANT NOTES

1. **NEVER commit `.env` files** - Double-check `.gitignore` before any commit
2. **Use strong, random passwords** - Generate with: `openssl rand -base64 32`
3. **Change default database passwords** immediately
4. **Test in staging environment** before applying to production
5. **Backup database** before applying changes
6. **Update team documentation** with new authentication flow

---

**Next Steps:**
1. Start with Phase 1 fixes immediately
2. Test each change thoroughly
3. Update this document as fixes are completed
4. Schedule security review after implementation

**Questions or Issues:** Contact security team or create issue in repository.