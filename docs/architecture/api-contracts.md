# API Contracts

## Authentication

**POST /api/auth/signup**
```typescript
Request: {
  email: string;
  password: string;
}
Response: {
  success: true;
  data: { user: IUser; token: string; }
}
```

## Clips

**GET /api/clips**
```typescript
Response: {
  success: true;
  data: {
    clips: IClip[];
    total: number;
  }
}
```

## Dictation Comparison

**POST /api/dictation/compare**
```typescript
Request: {
  clipId: string;
  userInput: string;
}
Response: {
  success: true;
  data: {
    original: string;
    comparison: IComparisonResult[];
  }
}
```
